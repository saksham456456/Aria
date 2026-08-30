interface AriaTileProps {
  state: 'listening' | 'thinking' | 'speaking' | 'paused' | 'error';
}

export default function AriaTile({ state }: AriaTileProps) {

  const getBorderColor = () => {
    switch (state) {
      case 'speaking': return 'border-aria-purple';
      case 'thinking': return 'border-aria-purple-light';
      case 'listening': return 'border-surface-3 border-t-aria-purple/50';
      case 'error': return 'border-live-red';
      case 'paused':
      default:
        return 'border-surface-3';
    }
  };

  const getStatusText = () => {
    switch (state) {
      case 'speaking': return 'Speaking...';
      case 'thinking': return 'Thinking...';
      case 'listening': return 'Listening...';
      case 'error': return 'Error';
      case 'paused': return 'Paused';
      default: return 'Listening...';
    }
  };

  return (
    <div className={`bg-surface-1 flex flex-col items-center justify-center rounded-xl border-2 transition-colors relative overflow-hidden h-full min-h-[200px] w-full ${getBorderColor()} ${state === 'paused' ? 'opacity-50' : 'opacity-100'}`}>

      {/* Absolute top left badge */}
      <div className="absolute top-3 left-3 bg-role-aria/20 text-role-aria text-xs px-2 py-0.5 rounded font-bold tracking-wider">
         ARIA
      </div>

      <div className={`w-24 h-24 rounded-full flex flex-col items-center justify-center text-3xl mb-6 relative transition-all duration-300 ${state === 'speaking' ? 'bg-aria-purple animate-pulse-ring' : 'bg-surface-2'}`}>
         {state === 'thinking' && (
           <div className="absolute inset-0 border-4 border-t-aria-purple border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
         )}
         {state === 'error' ? '⚠️' : '🤖'}
      </div>

      {state === 'speaking' ? (
         <div className="flex items-end gap-1 h-8 mt-2">
            <div className="w-1.5 bg-aria-purple-light rounded-full animate-speaking-bar" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 bg-aria-purple-light rounded-full animate-speaking-bar" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 bg-aria-purple-light rounded-full animate-speaking-bar" style={{ animationDelay: '300ms' }} />
         </div>
      ) : (
         <div className="text-gray-400 text-sm font-medium tracking-wide mt-2">{getStatusText()}</div>
      )}

      {/* Bottom Bar overlay for consistency with VideoTile */}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-surface-0/60 backdrop-blur-sm flex items-center px-3 gap-2 border-t border-surface-3">
         <span className="text-white text-sm font-medium truncate">ARIA Co-Teacher</span>
      </div>
    </div>
  );
}
