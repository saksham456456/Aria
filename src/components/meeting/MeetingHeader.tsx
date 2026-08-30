import { useEffect, useState } from 'react';

type MeetingHeaderProps = {
  title: string;
  topic?: string;
  status: string;
  connectionState: string;
  startedAt?: string;
};

export default function MeetingHeader({ title, topic, status, connectionState, startedAt }: MeetingHeaderProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt) return;
    const startTime = new Date(startedAt).getTime();

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getConnColor = () => {
    if (connectionState === 'connected') return 'bg-connected-green';
    if (connectionState === 'disconnected' || connectionState === 'error') return 'bg-live-red';
    return 'bg-warning-amber';
  };

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <div className="h-14 px-4 bg-surface-1 text-white flex justify-between items-center border-b border-surface-3 shrink-0">
      <div className="flex items-center gap-3 overflow-hidden text-sm sm:text-base">
         <div className="font-bold text-aria-purple bg-surface-2 px-2 py-1 rounded hidden sm:block">ARIA</div>
         <h1 className="font-semibold truncate">{title}</h1>
         {topic && (
           <>
            <span className="text-gray-500 hidden sm:inline">&middot;</span>
            <span className="text-gray-400 truncate hidden sm:inline">{topic}</span>
           </>
         )}
      </div>
      <div className="flex gap-4 sm:gap-6 items-center text-xs sm:text-sm font-medium">
         {status === 'active' && (
           <div className="flex items-center gap-2 text-gray-300">
             <span className="w-2 h-2 rounded-full bg-live-red shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse"></span>
             LIVE {formatTime(elapsed)}
           </div>
         )}
        <div className="flex items-center gap-2 text-gray-300">
          <span className={`w-2 h-2 rounded-full ${getConnColor()}`}></span>
          <span className="hidden sm:inline">{capitalize(connectionState)}</span>
        </div>
      </div>
    </div>
  );
}
