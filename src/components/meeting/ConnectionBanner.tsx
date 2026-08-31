interface ConnectionBannerProps {
  state: 'idle' | 'joining' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'disconnecting' | 'error' | 'ended';
}

export default function ConnectionBanner({ state }: ConnectionBannerProps) {
  if (state === 'connected' || state === 'idle' || state === 'ended' || state === 'disconnecting') return null;

  let bgColor = 'bg-warning-amber';
  let textColor = 'text-amber-900';
  let message = '';

  switch (state) {
    case 'joining':
      message = 'Joining classroom...';
      break;
    case 'connecting':
      message = 'Connecting to media...';
      break;
    case 'reconnecting':
      message = 'Reconnecting...';
      break;
    case 'disconnected':
      bgColor = 'bg-live-red';
      textColor = 'text-white';
      message = 'Connection lost. Attempting to reconnect...';
      break;
    case 'error':
      bgColor = 'bg-live-red';
      textColor = 'text-white';
      message = 'Connection failed. Please refresh the page.';
      break;
  }

  return (
    <div className={`${bgColor} ${textColor} p-2 text-center text-sm font-medium flex items-center justify-center gap-2 shadow-md z-50 transition-colors`}>
      {(state === 'connecting' || state === 'reconnecting' || state === 'joining') && (
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {message}
    </div>
  );
}
