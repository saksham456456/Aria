/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAgoraMeeting } from '@/hooks/meeting/useAgoraMeeting';
import { useSession } from '@/hooks/classroom/useSession';
import { useParticipants } from '@/hooks/classroom/useParticipants';
import { useChat } from '@/hooks/classroom/useChat';
import { useSpeechRecognition } from '@/hooks/speech/useSpeechRecognition';
import { getAgoraClient } from '@/services/agora/agoraClient';
import { supabaseBrowser } from '@/services/supabase/client';

import MeetingHeader from './MeetingHeader';
import VideoGrid from './VideoGrid';
import VideoTile from './VideoTile';
import MeetingControls from './MeetingControls';
import ConnectionBanner from './ConnectionBanner';
import EndMeetingDialog from './EndMeetingDialog';
import ChatPanel from '../chat/ChatPanel';
import ParticipantsPanel from '../participants/ParticipantsPanel';
import AriaTile from '../aria/AriaTile';
import AriaPanel from '../aria/AriaPanel';

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

  if (!appUserId) return <div className="h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;

  return <MeetingRoomInner sessionId={sessionId} appUserId={appUserId} />;
}

function MeetingRoomInner({ sessionId, appUserId }: { sessionId: string, appUserId: string }) {
  const router = useRouter();
  const { session } = useSession(sessionId);
  const { participants } = useParticipants(sessionId);
  const { messages, sendMessage } = useChat(sessionId);

  const [activePanel, setActivePanel] = useState<'chat' | 'participants' | 'aria' | null>(null);
  const [showEndDialog, setShowEndDialog] = useState(false);

  const localParticipant = useMemo(() => participants.find((p: any) => p.app_user_id === appUserId), [participants, appUserId]);

  const {
    connectionState,
    localAudioTrack,
    localVideoTrack,
    remoteUsers,
    isMicEnabled,
    isCameraEnabled,
    toggleMic,
    toggleCamera,
    error
  } = useAgoraMeeting(sessionId, appUserId);

  useSpeechRecognition(sessionId, localParticipant?.id, localParticipant?.role, localParticipant?.name, isMicEnabled);

  useEffect(() => {
    if (session?.status === 'ended' || session?.status === 'ending') {
       router.push(`/summary/${sessionId}`);
    }
  }, [session?.status, router, sessionId]);

  const handleLeave = async () => {
      // 1. Stop ARIA activity (later phase)
      // 2. Stop speech recognition (later phase)

      // 3. Leave Agora
      try {
         const client = getAgoraClient();
         localAudioTrack?.close();
         localVideoTrack?.close();
         await client.leave();
      } catch (e) {
          console.error("Agora leave error", e);
      }

      // 4. Update Participant left_at
      if (localParticipant) {
          await supabaseBrowser.from('participants').update({ left_at: new Date().toISOString() }).eq('id', localParticipant.id);
      }

      // 5. Remove Supabase channels
      supabaseBrowser.removeAllChannels();

      // 6. Navigate
      router.push(localParticipant?.role === 'teacher' ? `/summary/${sessionId}` : '/');
  };

  const handleEndClass = async () => {
      setShowEndDialog(false);
      // update session status to ending
      await supabaseBrowser.from('sessions').update({ status: 'ending' }).eq('id', sessionId);
      // Backend /api/session/end will handle the rest in phase 9
      await handleLeave();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden">
      <ConnectionBanner state={connectionState} />
      {error && <div className="bg-red-500 text-white p-2">{error}</div>}

      <MeetingHeader
         title={session?.classrooms?.name || 'Classroom'}
         status={session?.status || 'active'}
         connectionState={connectionState}
         startedAt={session?.started_at}
      />

      <div className="flex flex-1 overflow-hidden">
         <div className="flex-1 flex flex-col overflow-hidden">
            <VideoGrid>
               {/* Local User */}
               <VideoTile
                  isLocal
                  name={`${localParticipant?.name || 'You'} (You)`}
                  role={localParticipant?.role || 'student'}
                  track={localVideoTrack}
                  hasAudio={isMicEnabled}
                  hasVideo={isCameraEnabled}
               />

               {/* ARIA Tile */}
               <AriaTile state="Listening..." />

               {/* Remote Users */}
               {Object.values(remoteUsers).map(user => {
                  const p = participants.find((p: any) => p.app_user_id === user.uid);
                  return (
                    <VideoTile
                       key={user.uid}
                       user={user}
                       name={p?.name || user.uid}
                       role={p?.role || 'student'}
                       track={user.videoTrack}
                    />
                  );
               })}
            </VideoGrid>

            <MeetingControls
               isMicEnabled={isMicEnabled}
               isCameraEnabled={isCameraEnabled}
               onToggleMic={toggleMic}
               onToggleCamera={toggleCamera}
               onToggleChat={() => setActivePanel(activePanel === 'chat' ? null : 'chat')}
               onToggleParticipants={() => setActivePanel(activePanel === 'participants' ? null : 'participants')}
               isTeacher={localParticipant?.role === 'teacher'}
               onToggleAria={() => setActivePanel(activePanel === 'aria' ? null : 'aria')}
               onLeave={() => localParticipant?.role === 'teacher' ? setShowEndDialog(true) : handleLeave()}
            />
         </div>

         {activePanel === 'chat' && (
            <ChatPanel
               messages={messages}
               onSendMessage={(text: string) => sendMessage(localParticipant?.id, localParticipant?.role, localParticipant?.name, text)}
               onClose={() => setActivePanel(null)}
            />
         )}
         {activePanel === 'participants' && (
            <ParticipantsPanel
               participants={participants}
               onClose={() => setActivePanel(null)}
            />
         )}
      </div>

      {activePanel === 'aria' && (
            <AriaPanel
               sessionId={sessionId}
               appUserId={appUserId}
               onClose={() => setActivePanel(null)}
               onCommand={(cmd: string) => console.log('Command:', cmd)} // phase 8 integration
            />
         )}
      <EndMeetingDialog
         isOpen={showEndDialog}
         onConfirm={handleEndClass}
         onCancel={() => setShowEndDialog(false)}
      />
    </div>
  );
}
