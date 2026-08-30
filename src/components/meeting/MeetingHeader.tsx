import { useEffect, useState } from 'react';

type MeetingHeaderProps = {
  title: string;
  status: string;
  connectionState: string;
  startedAt?: string;
};

export default function MeetingHeader({ title, status, connectionState, startedAt }: MeetingHeaderProps) {
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
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="p-4 bg-gray-800 text-white flex justify-between items-center border-b border-gray-700">
      <div className="flex items-center gap-4">
         <h1 className="text-xl font-bold">{title}</h1>
         {status === 'active' && <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> LIVE {formatTime(elapsed)}</div>}
      </div>
      <div className="flex gap-4">
        <span>Conn: {connectionState}</span>
      </div>
    </div>
  );
}
