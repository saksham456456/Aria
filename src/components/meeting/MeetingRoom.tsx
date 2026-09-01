/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/services/supabase/client';
import { useAgoraMeeting } from '@/hooks/meeting/useAgoraMeeting';
import { useSession } from '@/hooks/classroom/useSession';
import { useParticipants } from '@/hooks/classroom/useParticipants';
import { useAria } from '@/hooks/aria/useAria';
import { useSpeechRecognition } from '@/hooks/speech/useSpeechRecognition';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Users, Settings } from 'lucide-react';
import VideoGrid from './VideoGrid';
import ChatPanel from './ChatPanel';
import ParticipantsPanel from './ParticipantsPanel';
import AriaPanel from '../aria/AriaPanel';
import EndMeetingDialog from './EndMeetingDialog';

export default function MeetingRoom({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [appUserId, setAppUserId] = useState<string | null>(null);

  useEffect(() => {
    let id = localStorage.getItem('aria_user_id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('aria_user_id', id);
    }
    setAppUserId(id);
  }, []);

  const { session } = useSession(sessionId, appUserId || '');
  const sessionLoading = !session;
  const { participants } = useParticipants(sessionId, appUserId || '');

  const localParticipant = useMemo(
    () => participants.find((p) => p.app_user_id === appUserId),
    [participants, appUserId]
  );

  const isTeacher = localParticipant?.role === 'teacher';

  const {
    client: agoraClient,
        localVideoTrack,
    remoteUsers,
        isMicEnabled,
    isCameraEnabled: isVideoEnabled,
    toggleMic,
    toggleCamera: toggleVideo,
    leave,

  } = useAgoraMeeting(sessionId, appUserId || ''); //





  const [isSpeaking, setIsSpeaking] = useState(false);
  useSpeechRecognition(
    sessionId,
    localParticipant?.id,
    localParticipant?.role,
    localParticipant?.name,
    isMicEnabled,
    appUserId || '',
    setIsSpeaking
  );

  const { ariaMode, setAriaMode, ariaState, ariaPaused, pauseAria, resumeAria, sendCommand } = useAria({
    sessionId,
    appUserId: appUserId || '',
    role: localParticipant?.role as 'teacher' | 'student',
    agoraClient,
    isTeacherSpeaking: isTeacher && isSpeaking,
  });

  const [activeSidePanel, setActiveSidePanel] = useState<'chat' | 'participants' | 'aria' | null>('chat');
  const [showEndDialog, setShowEndDialog] = useState(false);

  const handleEndClass = useCallback(async () => {
    setShowEndDialog(false);
    pauseAria();
    const supabase = getSupabaseBrowser(appUserId!);
    await supabase.from('sessions').update({ status: 'ending' }).eq('id', sessionId);
    await leave();
    router.push(isTeacher ? `/summary/${sessionId}` : '/');
  }, [pauseAria, leave, appUserId, isTeacher, sessionId, router]);

  const handleLeaveClass = useCallback(async () => {
    await leave();
    router.push('/');
  }, [leave, router]);

  useEffect(() => {
    if (session?.status === 'ended') handleLeaveClass();
  }, [session?.status, handleLeaveClass]);

  if (!appUserId || sessionLoading || !localParticipant) {
    return <div className="h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">Loading classroom...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">

      {/* Header */}
      <header className="h-16 px-6 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <h1 className="font-semibold text-sm tracking-wide text-zinc-100">
            {session?.classrooms?.subject}: {session?.classrooms?.topic}
          </h1>
          <Badge variant="outline" className="text-zinc-400 border-zinc-700 bg-zinc-800/50 hidden md:inline-flex">
            Code: {session?.classrooms?.join_code}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={activeSidePanel === 'participants' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveSidePanel(p => p === 'participants' ? null : 'participants')}
            className={activeSidePanel === 'participants' ? 'bg-zinc-800' : 'text-zinc-400'}
          >
            <Users className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">People ({participants.length})</span>
          </Button>

          <Button
            variant={activeSidePanel === 'chat' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveSidePanel(p => p === 'chat' ? null : 'chat')}
            className={activeSidePanel === 'chat' ? 'bg-zinc-800' : 'text-zinc-400'}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Chat</span>
          </Button>

          {isTeacher && (
            <Button
              variant={activeSidePanel === 'aria' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveSidePanel(p => p === 'aria' ? null : 'aria')}
              className={activeSidePanel === 'aria' ? 'bg-purple-600 hover:bg-purple-700 border-transparent' : 'border-purple-600/50 text-purple-400 hover:bg-purple-900/20'}
            >
              <Settings className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">ARIA</span>
            </Button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">

        {/* Video Grid Area */}
        <main className="flex-1 bg-black relative p-2 md:p-4 overflow-y-auto">
          <VideoGrid
            localParticipant={localParticipant as any}
            localVideoTrack={localVideoTrack}
            remoteUsers={Object.values(remoteUsers) as any}
            participants={participants as any}
            activeSpeakerId={null}
            ariaState={ariaState}
            isMicEnabled={isMicEnabled}
            isVideoEnabled={isVideoEnabled}
            onAriaForceIntervene={isTeacher ? () => sendCommand("Provide a quick visual explanation of this step.") : undefined}
          />
        </main>

        {/* Side Panel Area */}
        {activeSidePanel && (
          <aside className="w-80 md:w-96 bg-zinc-900 border-l border-zinc-800 flex flex-col shrink-0 animate-in slide-in-from-right-2 duration-200">
            {activeSidePanel === 'chat' && (
              <ChatPanel sessionId={sessionId} appUserId={appUserId} participants={participants as any} onClose={() => setActiveSidePanel(null)} />
            )}
            {activeSidePanel === 'participants' && (
              <ParticipantsPanel participants={participants as any} onClose={() => setActiveSidePanel(null)} />
            )}
            {activeSidePanel === 'aria' && isTeacher && (
              <AriaPanel
                ariaMode={ariaMode}
                onSetAriaMode={setAriaMode}
                ariaPaused={ariaPaused}
                onPauseAria={pauseAria}
                onResumeAria={resumeAria}
                onForceIntervene={() => sendCommand("Teacher explicitly requested ARIA intervention.")}
                onClose={() => setActiveSidePanel(null)}
              />
            )}
          </aside>
        )}
      </div>

      {/* Footer Controls */}
      <footer className="h-20 bg-zinc-900 border-t border-zinc-800 px-6 flex items-center justify-between shrink-0">
        <div className="text-xs text-zinc-500 hidden md:block">
          Logged in as <span className="font-semibold text-zinc-300">{localParticipant.name}</span>
        </div>

        <div className="flex items-center justify-center gap-4 flex-1 md:flex-none">
          <Button
            size="icon"
            variant={isMicEnabled ? 'secondary' : 'destructive'}
            onClick={toggleMic}
            className={`rounded-full h-12 w-12 ${isMicEnabled ? 'bg-zinc-800 hover:bg-zinc-700' : ''}`}
          >
            {isMicEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </Button>

          <Button
            size="icon"
            variant={isVideoEnabled ? 'secondary' : 'destructive'}
            onClick={toggleVideo}
            className={`rounded-full h-12 w-12 ${isVideoEnabled ? 'bg-zinc-800 hover:bg-zinc-700' : ''}`}
          >
            {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>

          <Button
            size="icon"
            variant="destructive"
            onClick={() => isTeacher ? setShowEndDialog(true) : handleLeaveClass()}
            className="rounded-full h-12 w-12"
          >
            <PhoneOff className="w-5 h-5" />
          </Button>
        </div>

        <div className="w-32 hidden md:block" />
      </footer>

      <EndMeetingDialog
        isOpen={showEndDialog}
        onConfirm={handleEndClass}
        onCancel={() => setShowEndDialog(false)}
      />
    </div>
  );
}
