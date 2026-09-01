'use client';

import { AriaMode } from '@/hooks/aria/useAria';

interface MeetingControlsProps {
  isMicEnabled:     boolean;
  isCameraEnabled:  boolean;
  isScreenSharing:  boolean;
  activePanel:      string | null;
  isTeacher:        boolean;
  ariaMode?:        AriaMode;
  onToggleMic:      () => void;
  onToggleCamera:   () => void;
  onToggleScreenShare: () => void;
  onToggleChat:     () => void;
  onToggleParticipants: () => void;
  onToggleAria:     () => void;
  onLeave:          () => void;
}

interface CtrlBtnProps {
  onClick:    () => void;
  label:      string;
  icon:       React.ReactNode;
  active?:    boolean;
  danger?:    boolean;
  highlight?: string;   // extra badge text
  title?:     string;
}

function CtrlBtn({ onClick, label, icon, active, danger, highlight, title }: CtrlBtnProps) {
  return (
    <button
      onClick={onClick}
      title={title ?? label}
      className={`group relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-200 select-none ${
        danger
          ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
          : active
          ? 'bg-surface-3 hover:bg-surface-4 text-white'
          : 'bg-surface-2 hover:bg-surface-3 text-slate-300 hover:text-white'
      }`}
    >
      <span className="mb-0.5">{icon}</span>
      <span className="text-[9px] font-semibold tracking-wider opacity-80 group-hover:opacity-100 uppercase">{label}</span>
      {highlight && (
        <span className="absolute 0 text-[9px] font-bold bg-aria-purple text-white rounded px-1 leading-none py-0.5">
          {highlight}
        </span>
      )}
    </button>
  );
}

// Simple SVG icons to avoid icon library dependency
const MicOnIcon   = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 3a4 4 0 00-4 4v4a4 4 0 008 0V7a4 4 0 00-4-4z"/></svg>;
const MicOffIcon  = () => <svg className="w-5 h-5 text-live-red" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a9 9 0 0118 0v4a1 1 0 01-1 1h-1.586l-3.707 3.707a1 1 0 01-1.414 0L5.586 15zM15 11a3 3 0 11-6 0m6 0a3 3 0 01-6 0"/></svg>;
const CamOnIcon   = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>;
const CamOffIcon  = () => <svg className="w-5 h-5 text-live-red" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L21 21M5.636 5.636L3 3m2.636 2.636L15 12l-9.364 6.364z"/></svg>;
const ShareIcon   = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>;
const ChatIcon    = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>;
const PeopleIcon  = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>;
const AriaIcon    = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>;
const LeaveIcon   = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>;

const ARIA_MODE_BADGE: Record<AriaMode, string> = { auto: 'A', manual: 'M', silent: 'S' };

export default function MeetingControls({
  isMicEnabled, isCameraEnabled, isScreenSharing, activePanel,
  isTeacher, ariaMode, onToggleMic, onToggleCamera, onToggleScreenShare,
  onToggleChat, onToggleParticipants, onToggleAria, onLeave,
}: MeetingControlsProps) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center gap-3 p-3 bg-surface-1/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50">
      {/* Core media controls */}
      <CtrlBtn
        onClick={onToggleMic}
        label={isMicEnabled ? 'Mute' : 'Unmute'}
        icon={isMicEnabled ? <MicOnIcon /> : <MicOffIcon />}
        active={isMicEnabled}
        danger={!isMicEnabled}
        title={isMicEnabled ? 'Mute microphone' : 'Unmute microphone'}
      />
      <CtrlBtn
        onClick={onToggleCamera}
        label={isCameraEnabled ? 'Stop video' : 'Start video'}
        icon={isCameraEnabled ? <CamOnIcon /> : <CamOffIcon />}
        active={isCameraEnabled}
        danger={!isCameraEnabled}
        title={isCameraEnabled ? 'Stop camera' : 'Start camera'}
      />
      <CtrlBtn
        onClick={onToggleScreenShare}
        label={isScreenSharing ? 'Stop share' : 'Share'}
        icon={<ShareIcon />}
        active={isScreenSharing}
        highlight={isScreenSharing ? 'ON' : undefined}
        title={isScreenSharing ? 'Stop screen sharing' : 'Share your screen'}
      />

      {/* Separator */}
      <div className="h-8 w-px bg-white/10 mx-1" />

      {/* Panel toggles */}
      <CtrlBtn
        onClick={onToggleChat}
        label="Chat"
        icon={<ChatIcon />}
        active={activePanel === 'chat'}
        title="Open chat"
      />
      <CtrlBtn
        onClick={onToggleParticipants}
        label="People"
        icon={<PeopleIcon />}
        active={activePanel === 'participants'}
        title="View participants"
      />
      {isTeacher && (
        <CtrlBtn
          onClick={onToggleAria}
          label="ARIA"
          icon={<AriaIcon />}
          active={activePanel === 'aria'}
          highlight={ariaMode ? ARIA_MODE_BADGE[ariaMode] : undefined}
          title="Open ARIA controls"
        />
      )}

      {/* Separator */}
      <div className="h-8 w-px bg-white/10 mx-1" />

      {/* Leave */}
      <CtrlBtn
        onClick={onLeave}
        label={isTeacher ? 'End class' : 'Leave'}
        icon={<LeaveIcon />}
        danger
        title={isTeacher ? 'End class for everyone' : 'Leave the class'}
      />
    </div>
  );
}
