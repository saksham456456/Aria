'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/services/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

import { useParticipants } from '@/hooks/classroom/useParticipants';
import { useSession } from '@/hooks/classroom/useSession';
import { useChat } from '@/hooks/classroom/useChat';
import { useAgoraMeeting } from '@/hooks/meeting/useAgoraMeeting';
import { useAria } from '@/hooks/aria/useAria';
import { useSpeechRecognition } from '@/hooks/speech/useSpeechRecognition';

import VideoGrid from './VideoGrid';
import VideoTile from './VideoTile';
import MeetingHeader from './MeetingHeader';
import MeetingControls from './MeetingControls';
import ConnectionBanner from './ConnectionBanner';
import EndMeetingDialog from './EndMeetingDialog';
import ChatPanel from '../chat/ChatPanel';
import ParticipantsPanel from '../participants/ParticipantsPanel';
import AriaTile from '../aria/AriaTile';
import AriaPanel from '../aria/AriaPanel';
import ConfusionMeter from '../classroom/ConfusionMeter';
import PopQuiz from '../classroom/PopQuiz';
import AgentBrainTerminal from '../aria/AgentBrainTerminal';

export default function MeetingRoom({ sessionId }: { sessionId: string }) {
  const [appUserId, setAppUserId] = useState<string | null>(null);

  useEffect(() => {
    let id = localStorage.getItem('aria_user_id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('aria_user_id', id);
    }
    setAppUserId(id);
  }, []);

  if (!appUserId) {
    return (
      <div className="h-screen bg-surface-0 flex items-center justify-center">
        <div className="text-slate-400 text-sm">Loading Identity…</div>
      </div>
    );
  }

  return <MeetingRoomParticipantLoader sessionId={sessionId} appUserId={appUserId} />;
}

function MeetingRoomParticipantLoader({ sessionId, appUserId }: { sessionId: string; appUserId: string }) {
  const { participants } = useParticipants(sessionId, appUserId);
  const localParticipant = useMemo(() => participants.find(p => p.app_user_id === appUserId), [participants, appUserId]);

  if (!localParticipant) {
    return (
      <div className="h-screen bg-surface-0 flex items-center justify-center">
        <div className="text-slate-400 text-sm">Loading Classroom…</div>
      </div>
    );
  }

  return <MeetingRoomInner sessionId={sessionId} appUserId={appUserId} />;
}

function MeetingRoomInner({ sessionId, appUserId }: { sessionId: string; appUserId: string }) {
  const { participants } = useParticipants(sessionId, appUserId);
  const router = useRouter();

  const { session } = useSession(sessionId, appUserId);
  const { messages, sendMessage } = useChat(sessionId, appUserId);

  const [activePanel, setActivePanel] = useState<'chat' | 'participants' | 'aria' | null>(null);
  const [showBrain, setShowBrain] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [isTeacherSpeaking, setIsTeacherSpeaking] = useState(false);

  const handleTriggerQuiz = async () => {
    try {
      if (!appUserId) return;
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': appUserId },
        body: JSON.stringify({ sessionId })
      });
      
      const json = await res.json();
      if (!json.success) {
        alert(\`Quiz failed: \${json.error?.message || 'Unknown error'}\`);
        return;
      }
      if (json.success && json.data?.quiz) {
        // Teacher's client handles the broadcast because serverless edge functions drop websockets
        const supabase = getSupabaseBrowser(appUserId);
        const channel = supabase.channel(\`quiz-\${sessionId}\`);
        channel.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.send({
              type: 'broadcast',
              event: 'new_quiz',
              payload: { quiz: json.data.quiz },
            });
          }
        });
      }
    } catch (err) {
      console.error('Failed to trigger quiz:', err);
      alert('Failed to trigger quiz. Check console for details.');
    }
  };

  const localParticipant = useMemo(
    () => participants.find(p => p.app_user_id === appUserId),
    [participants, appUserId]
  );
  const isTeacher = localParticipant?.role === 'teacher';

  const {
    client: agoraClient,
    connectionState,
    localVideoTrack,
    remoteUsers,
    isMicEnabled,
    isCameraEnabled,
    isScreenSharing,
    toggleMic,
    toggleCamera,
    startScreenShare,
    stopScreenShare,
    leave,
    error: agoraError,
  } = useAgoraMeeting(sessionId, appUserId);

  const {
    ariaMode,
    pauseAria,
    voiceError,
  } = useAria({
    sessionId,
    appUserId,
    role: (localParticipant?.role as 'teacher' | 'student') ?? 'student',
    agoraClient: isTeacher ? agoraClient : null,
    isTeacherSpeaking,
  });

  const handleSpeakingChange = useCallback((speaking: boolean) => {
    setIsTeacherSpeaking(speaking);
  }, []);

  const commandsChannelRef = useRef<RealtimeChannel | null>(null);
  const toggleMicRef = useRef(toggleMic);
  const isMicEnabledRef = useRef(isMicEnabled);

  useEffect(() => {
    toggleMicRef.current = toggleMic;
    isMicEnabledRef.current = isMicEnabled;
  }, [toggleMic, isMicEnabled]);

  useEffect(() => {
    const supabase = getSupabaseBrowser(appUserId);
    const channel = supabase.channel(`room_commands:${sessionId}`);

    if (!isTeacher) {
      channel.on('broadcast', { event: 'mute_all' }, async () => {
        if (isMicEnabledRef.current) {
          await toggleMicRef.current();
        }
      });
    }

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED' && isTeacher) {
        commandsChannelRef.current = channel;
      }
    });

    return () => {
      commandsChannelRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [sessionId, appUserId, isTeacher]);

  const handleMuteAll = useCallback(() => {
    if (!isTeacher || !commandsChannelRef.current) return;
    commandsChannelRef.current.send({
      type: 'broadcast',
      event: 'mute_all',
    }).catch(() => {});
  }, [isTeacher]);

  useSpeechRecognition(
    sessionId,
    localParticipant?.id,
    localParticipant?.role,
    localParticipant?.name,
    isMicEnabled,
    appUserId,
    isTeacher ? handleSpeakingChange : undefined
  );

  useEffect(() => {
    if (session?.status === 'ended' || session?.status === 'ending') {
      router.push(`/summary/${sessionId}`);
    }
  }, [session?.status, router, sessionId]);

  const handleLeave = useCallback(async () => {
    pauseAria();
    try {
      await leave();
    } catch (e) {
      console.error('[MeetingRoom] Agora leave error', e);
    }
    const supabase = getSupabaseBrowser(appUserId);
    if (localParticipant) {
      await supabase
        .from('participants')
        .update({ left_at: new Date().toISOString() })
        .eq('id', localParticipant.id);
    }
    supabase.removeAllChannels();
    router.push(isTeacher ? `/summary/${sessionId}` : '/');
  }, [pauseAria, leave, localParticipant, appUserId, isTeacher, sessionId, router]);

  const handleEndClass = useCallback(async () => {
    setShowEndDialog(false);
    pauseAria();
    const supabase = getSupabaseBrowser(appUserId);
    await supabase.from('sessions').update({ status: 'ending' }).eq('id', sessionId);
    await handleLeave();
  }, [pauseAria, appUserId, sessionId, handleLeave]);

  const classroom = session?.classrooms;

  const togglePanel = useCallback(
    (panel: 'chat' | 'participants' | 'aria') =>
      setActivePanel(prev => prev === panel ? null : panel),
    []
  );

  return (
    <div className="flex flex-col h-screen bg-surface-0 text-white overflow-hidden">
      <ConnectionBanner state={connectionState} />

      {(agoraError || voiceError) && (
        <div className="bg-live-red/10 border-b border-live-red/30 text-live-red px-4 py-2 text-xs font-medium">
          {agoraError || voiceError}
        </div>
      )}

      <MeetingHeader
        title={classroom?.name ?? 'Classroom'}
        topic={classroom?.topic}
        status={session?.status ?? 'active'}
        connectionState={connectionState}
        startedAt={session?.started_at}
        participantCount={participants.length}
        grade={classroom?.grade}
        subject={classroom?.subject}
        joinCode={isTeacher ? classroom?.join_code : undefined}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative">
          <VideoGrid>
            <VideoTile
              isLocal
              name={localParticipant?.name ?? 'You'}
              role={localParticipant?.role ?? 'student'}
              track={localVideoTrack}
              hasAudio={isMicEnabled}
              hasVideo={isCameraEnabled}
            />

            {/* Special ARIA Tile */}
            {(remoteUsers[100] || activePanel === 'aria') && (
              <AriaTile user={remoteUsers[100]} />
            )}

            {Object.values(remoteUsers)
              .filter(user => String(user.uid) !== '100')
              .map(user => {
              const p = participants.find(part => part.app_user_id === String(user.uid));
              return (
                <VideoTile
                  key={user.uid}
                  user={user}
                  name={p?.name ?? String(user.uid)}
                  role={p?.role ?? 'student'}
                  track={user.videoTrack}
                />
              );
            })}
          </VideoGrid>

          {/* WOW Factor Components */}
          {appUserId && <PopQuiz sessionId={sessionId} appUserId={appUserId} />}
          {isTeacher && appUserId && <ConfusionMeter sessionId={sessionId} appUserId={appUserId} />}
          {appUserId && (
            <AgentBrainTerminal 
              sessionId={sessionId} 
              appUserId={appUserId} 
              isOpen={showBrain} 
            />
          )}

          <MeetingControls
            isMicEnabled={isMicEnabled}
            isCameraEnabled={isCameraEnabled}
            isScreenSharing={isScreenSharing}
            activePanel={activePanel}
            isTeacher={isTeacher}
            ariaMode={ariaMode}
            onToggleMic={toggleMic}
            onToggleCamera={toggleCamera}
            onToggleScreenShare={isScreenSharing ? stopScreenShare : startScreenShare}
            onToggleChat={() => togglePanel('chat')}
            onToggleParticipants={() => togglePanel('participants')}
            onToggleAria={() => togglePanel('aria')}
            onTriggerQuiz={handleTriggerQuiz}
            onToggleBrain={() => setShowBrain(!showBrain)}
            onMuteAll={handleMuteAll}
            onLeave={() => isTeacher ? setShowEndDialog(true) : handleLeave()}
          />
        </div>

        {activePanel === 'chat' && (
          <ChatPanel
            messages={messages}
            localRole={localParticipant?.role}
            onSendMessage={text => sendMessage(localParticipant?.id ?? '', localParticipant?.role ?? 'student', localParticipant?.name ?? 'User', text)}
            onClose={() => setActivePanel(null)}
          />
        )}

        {activePanel === 'participants' && (
          <ParticipantsPanel
            participants={participants}
            onClose={() => setActivePanel(null)}
            isTeacher={isTeacher}
            onMuteAll={handleMuteAll}
          />
        )}

        {activePanel === 'aria' && isTeacher && agoraClient && (
          <AriaPanel
            onClose={() => setActivePanel(null)}
          />
        )}
      </div>

      <EndMeetingDialog
        isOpen={showEndDialog}
        onConfirm={handleEndClass}
        onCancel={() => setShowEndDialog(false)}
      />
    </div>
  );
}
