import React from 'react';

interface MeetingControlsProps {
  isMicEnabled: boolean;
  isCameraEnabled: boolean;
  isScreenSharing: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onToggleChat: () => void;
  onToggleParticipants: () => void;
  onToggleAria: () => void;
  isTeacher: boolean;
  onLeave: () => void;
  activePanel: 'chat' | 'participants' | 'aria' | null;
}

export default function MeetingControls({
  isMicEnabled,
  isCameraEnabled,
  isScreenSharing,
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  onToggleChat,
  onToggleParticipants,
  onToggleAria,
  isTeacher,
  onLeave,
  activePanel
}: MeetingControlsProps) {

  return (
    <div className="h-20 bg-surface-1 border-t border-surface-3 flex items-center justify-center px-4 shrink-0">
      <div className="flex gap-2 sm:gap-4 items-center">

        {/* Mic */}
        <button
          onClick={onToggleMic}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full font-medium text-xs sm:text-sm transition-colors
            ${isMicEnabled ? 'bg-surface-2 hover:bg-surface-3 text-white' : 'bg-live-red/20 text-live-red hover:bg-live-red/30 border border-live-red/30'}`}
        >
          {isMicEnabled ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="2" y1="2" x2="22" y2="22"></line><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"></path><path d="M5 10v2a7 7 0 0 0 12 5"></path><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"></path><path d="M9 9v3a3 3 0 0 0 5.12 2.12"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
          )}
          <span className="hidden sm:inline">{isMicEnabled ? 'Mute' : 'Unmute'}</span>
        </button>

        {/* Cam */}
        <button
          onClick={onToggleCamera}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full font-medium text-xs sm:text-sm transition-colors
            ${isCameraEnabled ? 'bg-surface-2 hover:bg-surface-3 text-white' : 'bg-live-red/20 text-live-red hover:bg-live-red/30 border border-live-red/30'}`}
        >
          {isCameraEnabled ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
          )}
          <span className="hidden sm:inline">{isCameraEnabled ? 'Stop Cam' : 'Start Cam'}</span>
        </button>

        {/* Share */}
        <button
          onClick={onToggleScreenShare}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full font-medium text-xs sm:text-sm transition-colors
            ${isScreenSharing ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)]' : 'bg-surface-2 hover:bg-surface-3 text-white'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
          <span className="hidden sm:inline">Share</span>
        </button>

        <div className="w-px h-8 bg-surface-3 mx-1 sm:mx-2 hidden sm:block"></div>

        {/* Chat */}
        <button
          onClick={onToggleChat}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full font-medium text-xs sm:text-sm transition-colors
            ${activePanel === 'chat' ? 'bg-gray-100 text-gray-900' : 'bg-surface-2 hover:bg-surface-3 text-white'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          <span className="hidden sm:inline">Chat</span>
        </button>

        {/* People */}
        <button
          onClick={onToggleParticipants}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full font-medium text-xs sm:text-sm transition-colors
            ${activePanel === 'participants' ? 'bg-gray-100 text-gray-900' : 'bg-surface-2 hover:bg-surface-3 text-white'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <span className="hidden sm:inline">People</span>
        </button>

        {/* ARIA */}
        {isTeacher && (
          <button
            onClick={onToggleAria}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full font-medium text-xs sm:text-sm transition-colors
              ${activePanel === 'aria' ? 'bg-aria-purple-light text-gray-900' : 'bg-aria-purple hover:bg-aria-purple-light text-white'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a2 2 0 0 1 2 2c-.11 1.83 1.53 3.55 3.34 3.66a2 2 0 0 1 1.95 2.16c-.23 2.1 1.34 4.07 3.44 4.09A2 2 0 0 1 22 17.5a2 2 0 0 1-2 2c-1.88.11-3.52 1.83-3.66 3.66a2 2 0 0 1-2.16 1.95c-2.1-.23-4.07 1.34-4.09 3.44a2 2 0 0 1-3.59 0c-.02-2.1-1.99-4.07-4.09-3.44a2 2 0 0 1-2.16-1.95c-.14-1.83-1.78-3.55-3.66-3.66A2 2 0 0 1 2 17.5a2 2 0 0 1 2-2c2.1-.02 4.07-1.99 3.84-4.09a2 2 0 0 1 1.95-2.16c1.81-.11 3.45-1.83 3.34-3.66A2 2 0 0 1 12 2Z"></path></svg>
            <span className="hidden sm:inline">ARIA</span>
          </button>
        )}

        <div className="w-px h-8 bg-surface-3 mx-1 sm:mx-2 hidden sm:block"></div>

        {/* Leave */}
        <button
          onClick={onLeave}
          className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-live-red hover:bg-red-600 rounded-full font-bold text-white text-xs sm:text-sm transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:hidden"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          <span className="hidden sm:inline">Leave</span>
        </button>
      </div>
    </div>
  );
}
