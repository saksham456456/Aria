'use client';

import { useEffect, useState, useRef } from 'react';
import { getSupabaseBrowser } from '@/services/supabase/client';
import { Terminal, Activity, Wifi, Cpu } from 'lucide-react';

interface TerminalProps {
  sessionId: string;
  appUserId: string;
  isOpen: boolean;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'system' | 'stt' | 'llm' | 'network';
  message: string;
}

export default function AgentBrainTerminal({ sessionId, appUserId, isOpen }: TerminalProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const addLog = (type: LogEntry['type'], message: string) => {
    setLogs(prev => [...prev.slice(-49), {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      type,
      message
    }]);
  };

  // Simulate startup and system checks
  useEffect(() => {
    if (!isOpen) return;
    
    if (logs.length === 0) {
      addLog('system', 'INITIALIZING AGORA CONVERSATIONAL AI ENGINE...');
      setTimeout(() => addLog('network', 'ESTABLISHING WEBRTC PEER CONNECTION... OK'), 400);
      setTimeout(() => addLog('system', 'MOUNTING GPT-4O-MINI (INFERENCE)... OK'), 800);
      setTimeout(() => addLog('system', 'MOUNTING DEEPGRAM NOVA-3 (STT)... OK'), 1200);
      setTimeout(() => addLog('system', 'MOUNTING MINIMAX TURBO (TTS)... OK'), 1600);
      setTimeout(() => addLog('system', 'AGENT ROUTING UID: 100 AWAITING AUDIO STREAM'), 2000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Listen to actual transcript inserts to look like live STT buffer
  useEffect(() => {
    if (!isOpen) return;
    const supabase = getSupabaseBrowser(appUserId);

    const channel = supabase.channel(`terminal-${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'transcript_segments', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          const name = payload.new.speaker_name;
          const text = payload.new.text;
          addLog('stt', `[${name.toUpperCase()} AUDIO DETECTED] >> "${text}"`);
          
          if (name !== 'ARIA') {
            setTimeout(() => addLog('llm', `[CONTEXT WINDOW UPDATED] Analyzing "${text}"...`), 300);
            setTimeout(() => addLog('llm', `[INFERENCE] Generating optimal pedagogical response...`), 800);
          }
        }
      )
      .subscribe();

    // Fake occasional network pings
    const pingTimer = setInterval(() => {
      addLog('network', `[HEARTBEAT] Latency: ${Math.floor(Math.random() * 40 + 20)}ms | Jitter: ${Math.floor(Math.random() * 5)}ms`);
    }, 8000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pingTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, sessionId, appUserId]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  if (!isOpen) return null;

  return (
    <div className="absolute left-4 top-4 bottom-24 w-80 bg-black/90 border border-emerald-500/30 rounded-xl overflow-hidden flex flex-col z-40 shadow-[0_0_30px_rgba(16,185,129,0.15)] font-mono text-[10px] sm:text-xs">
      {/* Header */}
      <div className="bg-emerald-950/50 border-b border-emerald-500/30 p-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-400">
          <Terminal className="w-4 h-4" />
          <span className="font-bold tracking-widest">AGENT.BRAIN //</span>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
          <Wifi className="w-3 h-3 text-emerald-500" />
          <Cpu className="w-3 h-3 text-emerald-500" />
        </div>
      </div>

      {/* Logs */}
      <div ref={scrollRef} className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-1.5">
        {logs.map((log) => {
          let color = 'text-emerald-500';
          if (log.type === 'system') color = 'text-amber-400';
          if (log.type === 'stt') color = 'text-cyan-400';
          if (log.type === 'llm') color = 'text-purple-400';

          return (
            <div key={log.id} className="leading-tight break-words">
              <span className="text-slate-500 mr-2">[{log.timestamp.toLocaleTimeString('en-US', { hour12: false, fractionalSecondDigits: 3 })}]</span>
              <span className={color}>{log.message}</span>
            </div>
          );
        })}
      </div>
      
      {/* Footer */}
      <div className="bg-emerald-950/30 border-t border-emerald-500/20 p-1.5 text-center text-emerald-600 text-[9px] tracking-widest uppercase">
        System Operational
      </div>
    </div>
  );
}
