"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAgoraMeeting } from '@/hooks/meeting/useAgoraMeeting';
import { useSession } from '@/hooks/classroom/useSession';
import { useParticipants } from '@/hooks/classroom/useParticipants';
import { useChat } from '@/hooks/classroom/useChat';
import { useSpeechRecognition } from '@/hooks/speech/useSpeechRecognition';
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
import { useAria } from '@/hooks/aria/useAria';

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
  const [isTeacherSpeaking, setIsTeacherSpeaking] = useState(false);

  const localParticipant = useMemo(() => participants.find((p) => p.app_user_id === appUserId), [participants, appUserId]);
  const isTeacher = localParticipant?.role === 'teacher';

  const {
    connectionState,
    localVideoTrack,
    remoteUsers,
    isMicEnabled,
    isCameraEnabled,
    isScreenSharing,
    startScreenShare,
    stopScreenShare,
    toggleMic,
    toggleCamera,
    leave,
    client: agoraClient,
    error
  } = useAgoraMeeting(sessionId, appUserId);

  const {
    ariaMode, setAriaMode, ariaState, ariaPaused,
    pauseAria, resumeAria, sendCommand, voiceError,
  } = useAria({
    sessionId,
    appUserId,
    role: (localParticipant?.role as 'teacher' | 'student') ?? 'student',
    agoraClient: isTeacher ? agoraClient : null, // only teacher hosts ARIA
    isTeacherSpeaking,
  });

  useSpeechRecognition(
    sessionId,
    localParticipant?.id,
    localParticipant?.role,
    localParticipant?.name,
    isMicEnabled,
    isTeacher ? setIsTeacherSpeaking : undefined
  );

  useEffect(() => {
    if (session?.status === 'ended' || session?.status === 'ending') {
       router.push(`/summary/${sessionId}`);
    }
  }, [session?.status, router, sessionId]);

  const handleLeave = async () => {
      pauseAria();
      try {
         await leave();
      } catch (e) {
          console.error("Agora leave error", e);
      }

      if (localParticipant) {
          await supabaseBrowser.from('participants').update({ left_at: new Date().toISOString() }).eq('id', localParticipant.id);
      }

      supabaseBrowser.removeAllChannels();
      router.push(isTeacher ? `/summary/${sessionId}` : '/');
  };

  const handleEndClass = async () => {
      setShowEndDialog(false);
      pauseAria();
      await supabaseBrowser.from('sessions').update({ status: 'ending' }).eq('id', sessionId);
      await handleLeave();
  };

  const classroom = session?.classrooms;

  return (
    <div className="flex flex-col h-screen bg-[#0f1117] text-white overflow-hidden">
      <ConnectionBanner state={connectionState} />
      {(error || voiceError) && (
        <div className="bg-red-500/10 border-b border-red-500/30 text-red-400 px-4 py-2 text-sm">
          {error || voiceError}
        </div>
      )}

      <MeetingHeader
         title={classroom?.name || 'Classroom'}
         topic={classroom?.topic}
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
                  name={`${localParticipant?.name || 'You'}`}
                  role={localParticipant?.role || 'student'}
                  track={localVideoTrack}
                  hasAudio={isMicEnabled}
                  hasVideo={isCameraEnabled}
               />

               {/* ARIA Tile */}
               {isTeacher && (
                 <AriaTile state={ariaState} />
               )}

               {/* Remote Users */}
               {Object.values(remoteUsers).map(user => {
                  const p = participants.find((p) => p.app_user_id === user.uid);
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
               isScreenSharing={isScreenSharing}
               onToggleMic={toggleMic}
               onToggleCamera={toggleCamera}
               onToggleScreenShare={isScreenSharing ? stopScreenShare : startScreenShare}
               onToggleChat={() => setActivePanel(p => p === 'chat' ? null : 'chat')}
               onToggleParticipants={() => setActivePanel(p => p === 'participants' ? null : 'participants')}
               isTeacher={isTeacher}
               onToggleAria={() => setActivePanel(p => p === 'aria' ? null : 'aria')}
               onLeave={() => isTeacher ? setShowEndDialog(true) : handleLeave()}
               activePanel={activePanel}
            />
         </div>

         {/* Side panels */}
         {activePanel === 'chat' && (
            <ChatPanel
               messages={messages}
               localRole={localParticipant?.role || 'student'}
               onSendMessage={(text: string) => sendMessage(localParticipant?.id || '', localParticipant?.role || 'student', localParticipant?.name || 'User', text)}
               onClose={() => setActivePanel(null)}
            />
         )}
         {activePanel === 'participants' && (
            <ParticipantsPanel
               participants={participants}
               onClose={() => setActivePanel(null)}
            />
         )}
         {activePanel === 'aria' && isTeacher && (
            <AriaPanel
               appUserId={appUserId}
               ariaMode={ariaMode}
               onModeChange={setAriaMode}
               ariaPaused={ariaPaused}
               onPause={pauseAria}
               onResume={resumeAria}
               onCommand={sendCommand}
               agoraClient={agoraClient}
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
