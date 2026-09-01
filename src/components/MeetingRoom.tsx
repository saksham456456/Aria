'use client';

import React, { useState } from 'react';
import { useAgoraMeeting } from '@/hooks/useAgoraMeeting';
import { useMeetingSync } from '@/hooks/useMeetingSync';
import { useAriaEngine } from '@/hooks/useAriaEngine';
import { useSpeech } from '@/hooks/useSpeech';
import { VideoGrid } from './VideoGrid';
import { ChatPanel } from './ChatPanel';
import { ParticipantsPanel } from './ParticipantsPanel';
import { AriaControlPanel } from './AriaControlPanel';
import { AriaSandboxPanel } from './AriaSandboxPanel';

interface MeetingRoomProps {
  sessionId: string;
  channelName: string;
  userId: string;
  userName: string;
  role: 'teacher' | 'student';
  lessonContext: Record<string, unknown>;
}

export const MeetingRoom: React.FC<MeetingRoomProps> = ({
  sessionId,
  channelName,
  userId,
  userName,
  role,
  lessonContext
}) => {
  const numericUid = Math.abs(hashCode(userId));
  const [activeSidePanel, setActiveSidePanel] = useState<'chat' | 'participants' | 'aria' | 'sandbox' | null>('chat');

  const {
    client: agoraClient,
    localVideoTrack,
    remoteUsers,
    activeSpeakerUid,
    isMuted,
    isCameraOff,
    toggleMic,
    toggleCamera
  } = useAgoraMeeting(channelName, numericUid);

  const {
    participants,
    messages,
    transcripts,
    learningGaps,
    sendMessage,
    addTranscript,

  } = useMeetingSync(sessionId);

  const { ariaState, setMode, forceIntervene, speak } = useAriaEngine(
    sessionId,
    lessonContext,
    transcripts,
    participants,
    role === 'teacher',
    agoraClient
  );

  useSpeech(sessionId, userName, role, isMuted);

  return (
    <div className="flex h-screen w-screen bg-surface-0 text-gray-100 overflow-hidden font-sans">
      <div className="flex-1 flex flex-col h-full">
        <header className="h-16 px-6 bg-surface-1 border-b border-surface-3 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-live-red animate-pulse" />
            <h1 className="font-semibold text-sm tracking-wide text-white">
              {String(lessonContext?.subject || "")}: {String(lessonContext?.topic || "")}
            </h1>
            <span className="text-xs bg-surface-2 px-2.5 py-1 rounded-md text-gray-400 border border-surface-3">
              Room: {channelName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSidePanel(activeSidePanel === 'participants' ? null : 'participants')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                activeSidePanel === 'participants' ? 'bg-surface-3 border-gray-400 text-white' : 'bg-surface-2 border-surface-3 text-gray-300 hover:bg-surface-3'
              }`}
            >
              👥 People ({participants.length + 1})
            </button>
            <button
              onClick={() => setActiveSidePanel(activeSidePanel === 'chat' ? null : 'chat')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                activeSidePanel === 'chat' ? 'bg-surface-3 border-gray-400 text-white' : 'bg-surface-2 border-surface-3 text-gray-300 hover:bg-surface-3'
              }`}
            >
              💬 Chat ({messages.length})
            </button>
            {role === 'teacher' && (
              <button
                onClick={() => setActiveSidePanel(activeSidePanel === 'aria' ? null : 'aria')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
                  activeSidePanel === 'aria' ? 'bg-aria-purple border-aria-purple-light text-white' : 'bg-aria-purple-dim/40 border-aria-purple text-aria-purple-light hover:bg-aria-purple-dim'
                }`}
              >
                ✨ ARIA Controls
              </button>
            )}
            {role === 'teacher' && (
              <button
                onClick={() => setActiveSidePanel(activeSidePanel === 'sandbox' ? null : 'sandbox')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors flex items-center gap-1.5 ${
                  activeSidePanel === 'sandbox' ? 'bg-warning-amber text-black' : 'bg-warning-amber/10 border-warning-amber/30 text-warning-amber hover:bg-warning-amber/20'
                }`}
              >
                🧪 Sandbox
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 bg-surface-0 relative overflow-hidden">
          <VideoGrid
            localVideoTrack={localVideoTrack}
            localName={userName}
            localRole={role}
            isMuted={isMuted}
            isCameraOff={isCameraOff}
            remoteUsers={remoteUsers}
            participants={participants}
            activeSpeakerUid={activeSpeakerUid}
            ariaState={ariaState}
            onIntervene={forceIntervene}
            isTeacher={role === 'teacher'}
          />
        </main>

        <footer className="h-20 bg-surface-1 border-t border-surface-3 px-8 flex items-center justify-between z-20">
          <div className="text-xs text-gray-400">
            Logged in as <span className="font-semibold text-gray-200">{userName}</span> ({role})
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleMic}
              className={`p-3.5 rounded-full transition-all duration-200 shadow-md ${
                isMuted ? 'bg-live-red text-white hover:bg-red-600' : 'bg-surface-3 text-gray-200 hover:bg-surface-2'
              }`}
            >
              {isMuted ? '🔇 Unmute' : '🎙️ Mute'}
            </button>
            <button
              onClick={toggleCamera}
              className={`p-3.5 rounded-full transition-all duration-200 shadow-md ${
                isCameraOff ? 'bg-live-red text-white hover:bg-red-600' : 'bg-surface-3 text-gray-200 hover:bg-surface-2'
              }`}
            >
              {isCameraOff ? '🚫 Turn On Cam' : '📹 Stop Cam'}
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 rounded-full bg-live-red text-white font-medium text-xs hover:bg-red-700 transition-colors shadow-lg"
            >
              Leave Room
            </button>
          </div>

          <div className="flex items-center gap-2">
            {role === 'teacher' && (
              <button
                onClick={forceIntervene}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-aria-purple to-aria-purple-light text-white font-medium text-xs shadow-md hover:opacity-90 active:scale-95 transition-all"
              >
                Prompt ARIA
              </button>
            )}
          </div>
        </footer>
      </div>

      {activeSidePanel && (
        <aside className="w-80 md:w-96 h-full bg-surface-1 border-l border-surface-3 flex flex-col z-30 animate-slide-in-right">
          {activeSidePanel === 'chat' && (
            <ChatPanel
              messages={messages}
              onSendMessage={(text) => sendMessage(text, userName, role)}
              onClose={() => setActiveSidePanel(null)}
            />
          )}
          {activeSidePanel === 'participants' && (
            <ParticipantsPanel
              participants={participants}
              localUser={{ id: userId, name: userName, role }}
              onClose={() => setActiveSidePanel(null)}
            />
          )}
          {activeSidePanel === 'aria' && (
            <AriaControlPanel
              ariaState={ariaState}
              onSetMode={setMode}
              onForceIntervene={forceIntervene}
              learningGaps={learningGaps}
              onClose={() => setActiveSidePanel(null)}
            />
          )}
          {activeSidePanel === 'sandbox' && (
            <AriaSandboxPanel
              onInjectTranscript={(text, speakerName, speakerRole) => addTranscript({ speaker_name: speakerName, speaker_role: speakerRole, text })}
              onTestVoice={(text) => speak(text, agoraClient)}
              onClose={() => setActiveSidePanel(null)}
            />
          )}
        </aside>
      )}
    </div>
  );
};

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}
