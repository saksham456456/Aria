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

  // Extract just the stroke/glow color from the current state
  const getGlowColor = () => {
    if (level < 40) return 'rgba(52, 211, 153, 0.4)'; // emerald
    if (level < 75) return 'rgba(251, 191, 36, 0.6)'; // amber
    return 'rgba(244, 63, 94, 0.8)'; // rose
  };

  const getStrokeColor = () => {
    if (level < 40) return '#34d399';
    if (level < 75) return '#fbbf24';
    return '#f43f5e';
  };

  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (level / 100) * circumference;

  return (
    <div className="absolute top-4 right-4 z-50 glass rounded-2xl p-4 flex flex-col items-center min-w-[140px] transition-all duration-300 shadow-2xl"
         style={{ boxShadow: `0 0 30px ${getGlowColor()}` }}>
      <p className="text-[10px] text-slate-300 font-bold mb-3 uppercase tracking-widest">Class Status</p>
      
      <div className="relative flex items-center justify-center w-16 h-16 mb-3">
        {/* Radar sweeping background effect if high confusion */}
        {level >= 75 && (
          <div className="absolute inset-0 rounded-full border border-rose-500/50 animate-ping opacity-75" />
        )}
        
        {/* Background track */}
        <svg className="w-full h-full transform -rotate-90">
          <circle 
            cx="32" cy="32" r={radius} 
            stroke="rgba(255,255,255,0.1)" 
            strokeWidth="4" 
            fill="transparent" 
          />
          {/* Animated fill */}
          <circle 
            cx="32" cy="32" r={radius} 
            stroke={getStrokeColor()}
            strokeWidth="4" 
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        
        {/* Center percentage */}
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className={`text-sm font-black transition-colors duration-500 ${getColor().split(' ')[0]}`}>
            {level}%
          </span>
        </div>
      </div>

      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${getColor()} transition-colors duration-300 uppercase tracking-wider`}>
        {getLabel()}
      </span>
    </div>
  );
}
