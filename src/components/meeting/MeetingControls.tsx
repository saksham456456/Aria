'use client';

import { AriaMode } from '@/hooks/aria/useAria';
import { 
  Mic, MicOff, Video, VideoOff, MonitorUp, 
  MessageSquare, Users, Sparkles, BrainCircuit,
  LogOut, MicOff as MuteAllIcon, Brain
} from 'lucide-react';

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
  onTriggerQuiz?:   () => void;
  onToggleBrain?:   () => void;
  onMuteAll?:       () => void;
  onLeave:          () => void;
}

function CtrlBtn({
  onClick, icon, label, active, danger, highlight, title
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  danger?: boolean;
  highlight?: string;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`group relative flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl transition-all duration-300 ${
        danger
          ? 'bg-red-500/90 hover:bg-red-500 text-white shadow-lg shadow-red-500/25'
          : active
          ? 'bg-white/10 hover:bg-white/15 text-white ring-1 ring-white/10'
          : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white'
      }`}
    >
      <span className={`mb-0.5 ${danger ? '' : (active ? 'text-white' : 'text-slate-400 group-hover:text-white')}`}>
        {icon}
      </span>
      <span className="text-[9px] font-semibold tracking-wider opacity-80 group-hover:opacity-100 uppercase">{label}</span>
      {highlight && (
        <span className="absolute top-0 right-0 text-[9px] font-bold bg-aria-purple text-white rounded px-1 leading-none py-0.5 translate-x-1/4 -translate-y-1/4 shadow-md">
          {highlight}
        </span>
      )}
    </button>
  );
}

const ARIA_MODE_BADGE: Record<AriaMode, string> = { auto: 'A', manual: 'M', silent: 'S' };

export default function MeetingControls({
  isMicEnabled, isCameraEnabled, isScreenSharing, activePanel,
  isTeacher, ariaMode, onToggleMic, onToggleCamera, onToggleScreenShare,
  onToggleChat, onToggleParticipants, onToggleAria, onTriggerQuiz, onToggleBrain, onMuteAll, onLeave,
}: MeetingControlsProps) {
  return (
    <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-surface-0/85 backdrop-blur-2xl border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/60">
      {/* Core media controls */}
      <CtrlBtn
        onClick={onToggleMic}
        label={isMicEnabled ? 'Mute' : 'Unmute'}
        icon={isMicEnabled ? <Mic size={20} strokeWidth={2} /> : <MicOff size={20} strokeWidth={2} />}
        active={isMicEnabled}
        danger={!isMicEnabled}
        title={isMicEnabled ? 'Mute microphone' : 'Unmute microphone'}
      />
      <CtrlBtn
        onClick={onToggleCamera}
        label={isCameraEnabled ? 'Stop video' : 'Start video'}
        icon={isCameraEnabled ? <Video size={20} strokeWidth={2} /> : <VideoOff size={20} strokeWidth={2} />}
        active={isCameraEnabled}
        danger={!isCameraEnabled}
        title={isCameraEnabled ? 'Stop camera' : 'Start camera'}
      />
      <CtrlBtn
        onClick={onToggleScreenShare}
        label={isScreenSharing ? 'Stop share' : 'Share'}
        icon={<MonitorUp size={20} strokeWidth={2} />}
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
        icon={<MessageSquare size={20} strokeWidth={2} />}
        active={activePanel === 'chat'}
        title="Open chat"
      />
      <CtrlBtn
        onClick={onToggleParticipants}
        label="People"
        icon={<Users size={20} strokeWidth={2} />}
        active={activePanel === 'participants'}
        title="View participants"
      />
      {isTeacher && (
        <CtrlBtn
          onClick={onToggleAria}
          label="ARIA"
          icon={<Sparkles size={20} strokeWidth={2} />}
          active={activePanel === 'aria'}
          highlight={ariaMode ? ARIA_MODE_BADGE[ariaMode] : undefined}
          title="Open ARIA controls"
        />
      )}
      {isTeacher && onTriggerQuiz && (
        <CtrlBtn
          onClick={onTriggerQuiz}
          label="Quiz"
          icon={<BrainCircuit size={20} strokeWidth={2} className="text-emerald-400" />}
          title="Generate AI Pop Quiz"
        />
      )}
      {isTeacher && onToggleBrain && (
        <CtrlBtn
          onClick={onToggleBrain}
          label="Terminal"
          icon={<Brain size={20} strokeWidth={2} className="text-emerald-400" />}
          title="Toggle Agent Brain"
        />
      )}
      {isTeacher && onMuteAll && (
        <CtrlBtn
          onClick={onMuteAll}
          label="Mute all"
          icon={<MuteAllIcon size={20} strokeWidth={2} />}
          title="Mute all students"
        />
      )}

      {/* Separator */}
      <div className="h-8 w-px bg-white/10 mx-1" />

      {/* Leave */}
      <CtrlBtn
        onClick={onLeave}
        label={isTeacher ? 'End class' : 'Leave'}
        icon={<LogOut size={20} strokeWidth={2} />}
        danger
        title={isTeacher ? 'End class for everyone' : 'Leave the class'}
      />
    </div>
  );
}
