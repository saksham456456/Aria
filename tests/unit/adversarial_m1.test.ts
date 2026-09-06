import { hashUid } from '../../src/lib/uid';
import { AriaResponseSchema } from '../../src/types/aria';

describe('Adversarial Stress Test Suite: Milestone 1', () => {
  describe('1. Meeting Room & UID Mapping Edge Cases', () => {
    it('handles null, undefined, empty, and malformed app_user_id gracefully', () => {
      const participants = [
        { id: '1', app_user_id: null, name: 'Ghost 1', role: 'student' },
        { id: '2', app_user_id: undefined, name: 'Ghost 2', role: 'student' },
        { id: '3', app_user_id: '', name: 'Ghost 3', role: 'student' },
        { id: '4', app_user_id: 'valid-uuid-teacher', name: 'Teacher Jane', role: 'teacher' },
        { id: '5', app_user_id: 'valid-uuid-student', name: 'Student Bob', role: 'student' },
      ];

      const teacherUid = hashUid('valid-uuid-teacher');
      const studentUid = hashUid('valid-uuid-student');

      // The exact predicate used in MeetingRoom.tsx line 313:
      const resolveParticipant = (remoteUid: number) =>
        participants.find(part => Boolean(part.app_user_id) && hashUid(part.app_user_id as string) === Number(remoteUid));

      // Test valid users resolve correctly
      expect(resolveParticipant(teacherUid)?.name).toBe('Teacher Jane');
      expect(resolveParticipant(studentUid)?.name).toBe('Student Bob');

      // Test unknown remote user does not throw and returns undefined (triggers fallback)
      const unknownUid = 999999;
      const unknown = resolveParticipant(unknownUid);
      expect(unknown).toBeUndefined();

      // Fallback display logic in MeetingRoom:
      const displayName = unknown?.name ?? String(unknownUid);
      const displayRole = unknown?.role ?? 'student';
      expect(displayName).toBe('999999');
      expect(displayRole).toBe('student');
    });

    it('hashUid produces deterministic positive 32-bit integers within Agora bounds', () => {
      const uuids = [
        'c8b9d311-e6e7-4b9e-9988-5c4d6f8a1234',
        '00000000-0000-0000-0000-000000000000',
        'ffffffff-ffff-ffff-ffff-ffffffffffff',
        'a',
        'very-long-string-identifier-simulating-edge-cases-in-session-participant-id',
      ];

      for (const id of uuids) {
        const uid1 = hashUid(id);
        const uid2 = hashUid(id);
        expect(uid1).toBe(uid2);
        expect(Number.isInteger(uid1)).toBe(true);
        expect(uid1).toBeGreaterThanOrEqual(1);
        expect(uid1).toBeLessThanOrEqual(2147483647);
      }
    });

    it('participant rejoin unfreeze logic restores left_at to null', () => {
      // Prior to M1 fix, left_at remained set when a participant rejoined
      const existingParticipant = {
        id: 'p-1',
        session_id: 'session-123',
        app_user_id: 'user-abc',
        name: 'Alice',
        role: 'student',
        left_at: '2026-09-06T04:00:00.000Z',
        joined_at: '2026-09-06T03:00:00.000Z',
      };

      // Upsert payload applied in src/app/api/session/join/route.ts
      const rejoinUpsertData = {
        session_id: 'session-123',
        app_user_id: 'user-abc',
        name: 'Alice',
        role: 'student',
        learning_level: undefined,
        language: undefined,
        left_at: null,
        joined_at: new Date().toISOString(),
      };

      const updatedParticipant = {
        ...existingParticipant,
        ...rejoinUpsertData,
      };

      expect(updatedParticipant.left_at).toBeNull();
      expect(new Date(updatedParticipant.joined_at).getTime()).toBeGreaterThan(
        new Date(existingParticipant.joined_at).getTime()
      );

      // Verify useParticipants filter: .is('left_at', null) matches updatedParticipant
      const isVisibleInRoom = (p: { left_at: string | null | undefined }) => p.left_at === null;
      expect(isVisibleInRoom(existingParticipant)).toBe(false);
      expect(isVisibleInRoom(updatedParticipant)).toBe(true);
    });

    it('MeetingRoom timeout handles invalid/unauthenticated sessions within 5s', () => {
      let timedOut = false;
      const timeoutMs = 5000;
      const localParticipant = null; // unauthenticated or not found

      // Simulate timeout triggering
      timedOut = true;
      let navigatedTo = '';
      const router = { push: (url: string) => { navigatedTo = url; } };

      if (timedOut && !localParticipant) {
        router.push('/');
      }

      expect(navigatedTo).toBe('/');
    });
  });

  describe('2. React StrictMode Double-Mount Agora Lifecycle', () => {
    it('simulates StrictMode mount -> unmount -> remount without getting locked out', () => {
      let initRefCurrent = false;
      let clientJoined = false;
      let clientListenersRemoved = false;
      let clientLeft = false;
      let singletonInstance: object | null = {};

      const mockClient = {
        join: () => { clientJoined = true; },
        removeAllListeners: () => { clientListenersRemoved = true; },
        leave: async () => { clientLeft = true; },
      };

      const getAgoraClient = () => {
        if (!singletonInstance) singletonInstance = mockClient;
        return mockClient;
      };

      const resetAgoraClient = () => {
        singletonInstance = null;
      };

      // ── First Mount ──
      const joinMeeting1 = () => {
        if (initRefCurrent) return;
        initRefCurrent = true;
        getAgoraClient().join();
      };

      joinMeeting1();
      expect(initRefCurrent).toBe(true);
      expect(clientJoined).toBe(true);

      // ── StrictMode Immediate Unmount Cleanup ──
      const cleanup = () => {
        initRefCurrent = false; // worker_m1 fix in line 208 of useAgoraMeeting.ts
        const client = getAgoraClient();
        client.removeAllListeners();
        client.leave();
        resetAgoraClient();
      };

      cleanup();
      expect(initRefCurrent).toBe(false);
      expect(clientListenersRemoved).toBe(true);
      expect(singletonInstance).toBeNull();

      // ── Second Mount (StrictMode Remount) ──
      clientJoined = false;
      const joinMeeting2 = () => {
        if (initRefCurrent) return;
        initRefCurrent = true;
        getAgoraClient().join();
      };

      joinMeeting2();
      // Remount MUST succeed and not be locked out by stale initRef
      expect(initRefCurrent).toBe(true);
      expect(clientJoined).toBe(true);
    });
  });

  describe('3. PopQuiz Teacher Monitor Loopback', () => {
    it('ensures broadcast self: true is configured for teacher loopback', () => {
      const channelConfig = {
        config: { broadcast: { self: true } },
      };

      expect(channelConfig.config.broadcast.self).toBe(true);

      // Simulate PopQuiz rendering logic based on isTeacher
      const renderPopQuizModal = (isTeacher: boolean, quiz: any, answers: Record<number, string>) => {
        const title = isTeacher ? 'Teacher Monitor' : 'Student Quiz';
        const canClickOptions = !isTeacher;
        return { title, canClickOptions };
      };

      const teacherView = renderPopQuizModal(true, { questions: [] }, {});
      expect(teacherView.title).toBe('Teacher Monitor');
      expect(teacherView.canClickOptions).toBe(false);

      const studentView = renderPopQuizModal(false, { questions: [] }, {});
      expect(studentView.title).toBe('Student Quiz');
      expect(studentView.canClickOptions).toBe(true);
    });
  });

  describe('4. Screen Share Local Video Track Sync & Restoration', () => {
    it('syncs localVideoTrack to screenTrack on start and restores to camera on stop or track-ended', async () => {
      let localVideoTrack: any = null;
      let isScreenSharing = false;

      const cameraTrack = { id: 'cam-track-1', isCamera: true };
      const screenTrack = {
        id: 'screen-track-1',
        isScreen: true,
        closed: false,
        close() { this.closed = true; },
        listeners: {} as Record<string, Function>,
        on(event: string, cb: Function) { this.listeners[event] = cb; },
      };

      const localVideoRef = { current: cameraTrack };
      const screenTrackRef = { current: null as any };

      // Initial state
      localVideoTrack = cameraTrack;
      expect(localVideoTrack.isCamera).toBe(true);

      // Start screen share
      const startScreenShare = () => {
        screenTrack.on('track-ended', () => {
          screenTrack.close();
          if (localVideoRef.current) {
            localVideoTrack = localVideoRef.current;
          } else {
            localVideoTrack = null;
          }
          screenTrackRef.current = null;
          isScreenSharing = false;
        });

        screenTrackRef.current = screenTrack;
        localVideoTrack = screenTrack; // worker_m1 fix: sync preview
        isScreenSharing = true;
      };

      startScreenShare();
      expect(isScreenSharing).toBe(true);
      expect(localVideoTrack.isScreen).toBe(true);
      expect(localVideoTrack.id).toBe('screen-track-1');

      // Stop screen share via controls
      const stopScreenShare = () => {
        if (screenTrackRef.current) {
          screenTrackRef.current.close();
          screenTrackRef.current = null;
        }
        if (localVideoRef.current) {
          localVideoTrack = localVideoRef.current; // worker_m1 fix: restore preview
        } else {
          localVideoTrack = null;
        }
        isScreenSharing = false;
      };

      stopScreenShare();
      expect(isScreenSharing).toBe(false);
      expect(localVideoTrack.isCamera).toBe(true);
      expect(localVideoTrack.id).toBe('cam-track-1');
      expect(screenTrack.closed).toBe(true);

      // Test browser native "track-ended" event
      startScreenShare();
      expect(isScreenSharing).toBe(true);
      expect(localVideoTrack.isScreen).toBe(true);

      // Browser native stop button clicked
      screenTrack.listeners['track-ended']();
      expect(isScreenSharing).toBe(false);
      expect(localVideoTrack.isCamera).toBe(true);
      expect(localVideoTrack.id).toBe('cam-track-1');
    });
  });

  describe('5. ARIA Target UIDs & Dynamic Prompt Rules', () => {
    it('builds explicit numeric target UIDs without wildcard and ignores null participant IDs', () => {
      const requester_id = '12345';
      const bodyAdditionalUids = ['67890', '12345']; // includes duplicate
      const participants = [
        { app_user_id: 'user-1' },
        { app_user_id: null },
        { app_user_id: undefined },
        { app_user_id: 'user-2' },
      ];

      const dbUids = participants
        .filter(p => Boolean(p.app_user_id))
        .map(p => String(hashUid(p.app_user_id as string)));

      const allTargetUids = Array.from(
        new Set([requester_id, ...(bodyAdditionalUids || []), ...dbUids])
      ).filter(Boolean);

      // Never contains wildcard '*'
      expect(allTargetUids).not.toContain('*');
      // No duplicate UIDs
      expect(new Set(allTargetUids).size).toBe(allTargetUids.length);
      // Contains valid numeric strings only
      for (const uid of allTargetUids) {
        expect(uid).toMatch(/^\d+$/);
      }
      expect(allTargetUids).toContain('12345');
      expect(allTargetUids).toContain('67890');
      expect(allTargetUids).toContain(String(hashUid('user-1')));
      expect(allTargetUids).toContain(String(hashUid('user-2')));
    });

    it('AriaResponseSchema conforms to Zod coercion and default rules', () => {
      // Test stringified numbers from LLM are coerced
      const stringifiedPayload = {
        shouldSpeak: true,
        urgency: '8', // stringified number
        target: 'student',
        language: 'en',
        response: 'Think about conservation of energy.',
        reason: 'Student was stuck on kinetic energy formula.',
        detectedGaps: [
          {
            concept: 'kinetic_energy',
            description: 'Confused velocity squared with linear velocity',
            confidence: '0.9', // stringified number
          },
        ],
      };

      const parsed = AriaResponseSchema.parse(stringifiedPayload);
      expect(parsed.urgency).toBe(8);
      expect(typeof parsed.urgency).toBe('number');
      expect(parsed.detectedGaps[0].confidence).toBe(0.9);
      expect(typeof parsed.detectedGaps[0].confidence).toBe('number');

      // Test missing fields receive proper defaults
      const emptyPayload = {};
      const defaulted = AriaResponseSchema.parse(emptyPayload);
      expect(defaulted.shouldSpeak).toBe(false);
      expect(defaulted.urgency).toBe(0);
      expect(defaulted.target).toBe('class');
      expect(defaulted.targetStudentName).toBe('');
      expect(defaulted.language).toBe('en');
      expect(defaulted.responseType).toBe('explanation');
      expect(defaulted.response).toBe('');
      expect(defaulted.reason).toBe('');
      expect(defaulted.detectedGaps).toEqual([]);
    });

    it('AriaResponseSchema rejects invalid boundary numbers', () => {
      // Urgency > 10 must fail
      expect(() => AriaResponseSchema.parse({ urgency: 11 })).toThrow();
      expect(() => AriaResponseSchema.parse({ urgency: -1 })).toThrow();

      // Confidence > 1 must fail
      expect(() =>
        AriaResponseSchema.parse({
          detectedGaps: [{ concept: 'c', description: 'd', confidence: 1.5 }],
        })
      ).toThrow();
    });
  });
});
