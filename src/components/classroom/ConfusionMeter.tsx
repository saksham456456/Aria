'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowser } from '@/services/supabase/client';

interface ConfusionMeterProps {
  sessionId: string;
  appUserId: string;
}

const CONFUSION_WORDS = ['how', 'why', 'what', 'confused', 'lost', 'explain', 'understand', 'repeat', 'again'];

export default function ConfusionMeter({ sessionId, appUserId }: ConfusionMeterProps) {
  const [level, setLevel] = useState(0);

  useEffect(() => {
    const supabase = getSupabaseBrowser(appUserId);

    const channel = supabase.channel(`meter-${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'transcript_segments', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          const text = (payload.new.text || '').toLowerCase();
          const hasConfusion = CONFUSION_WORDS.some(w => text.includes(w));
          if (hasConfusion) {
            setLevel(prev => Math.min(prev + 20, 100));
          } else {
            setLevel(prev => Math.max(prev - 5, 0));
          }
        }
      )
      .subscribe();

    // Auto-decay the meter every 5 seconds if no one is talking
    const decayTimer = setInterval(() => {
      setLevel(prev => Math.max(prev - 2, 0));
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(decayTimer);
    };
  }, [sessionId, appUserId]);

  const getColor = () => {
    if (level < 40) return 'text-emerald-400 bg-emerald-400/20 border-emerald-500/30';
    if (level < 75) return 'text-amber-400 bg-amber-400/20 border-amber-500/30';
    return 'text-rose-500 bg-rose-500/20 border-rose-500/30 animate-pulse';
  };

  const getLabel = () => {
    if (level < 40) return 'Clear';
    if (level < 75) return 'Pondering';
    return 'Confused';
  };

  return (
    <div className="absolute top-4 right-4 z-50 glass rounded-xl p-3 flex flex-col items-center min-w-[120px] transition-all duration-300">
      <p className="text-xs text-slate-400 font-medium mb-2 uppercase tracking-widest">Class Confusion</p>
      <div className="relative w-full h-2 bg-black/40 rounded-full overflow-hidden mb-2">
        <div 
          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${getColor().split(' ')[1].replace('/20', '')}`} 
          style={{ width: `${level}%` }} 
        />
      </div>
      <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${getColor()} transition-colors duration-300`}>
        {getLabel()} ({level}%)
      </span>
    </div>
  );
}
