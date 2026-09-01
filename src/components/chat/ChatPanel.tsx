'use client';

import { useRef, useEffect, FormEvent } from 'react';
import { Message } from '@/types/session';

const ROLE_BUBBLE: Record<string, string> = {
  teacher: 'bg-role-teacher/10 border-role-teacher/20',
  student: 'bg-surface-2 border-surface-3',
  aria:    'bg-aria-purple/10 border-aria-purple/20',
};

const ROLE_NAME_COLOR: Record<string, string> = {
  teacher: 'text-role-teacher',
  student: 'text-role-student',
  aria:    'text-aria-purple-light',
};

interface ChatPanelProps {
  messages:       Message[];
  localRole?:     string;
  onSendMessage:  (text: string) => void;
  onClose:        () => void;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatPanel({ messages, onSendMessage, onClose }: ChatPanelProps) {
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = inputRef.current;
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    onSendMessage(text);
    input.value = '';
    input.focus();
  };

  return (
    <div className="w-80 shrink-0 border-l border-surface-3 bg-surface-1 flex flex-col h-full animate-slide-in-right">
      {/* Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-surface-3 shrink-0">
        <h2 className="text-sm font-semibold text-white">Chat</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-lg leading-none">&times;</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <p className="text-slate-500 text-xs text-center py-8">No messages yet. Start the conversation!</p>
        )}
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`rounded-xl border px-3 py-2 text-sm animate-fade-in ${ROLE_BUBBLE[msg.role] ?? ROLE_BUBBLE.student}`}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className={`text-xs font-semibold ${ROLE_NAME_COLOR[msg.role] ?? 'text-slate-300'}`}>
                {msg.sender_name}
                {msg.role === 'aria' && (
                  <span className="ml-1.5 text-[10px] bg-aria-purple/20 text-aria-purple-light border border-aria-purple/30 px-1 py-0.5 rounded uppercase tracking-wide font-bold">
                    AI
                  </span>
                )}
              </span>
              <span className="text-[10px] text-slate-500 shrink-0">{formatTime(msg.created_at)}</span>
            </div>
            <p className="text-slate-200 leading-snug break-words">{msg.text}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-surface-3 flex gap-2 shrink-0">
        <input
          ref={inputRef}
          placeholder="Type a message…"
          maxLength={500}
          className="flex-1 min-w-0 bg-surface-2 border border-surface-3 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-aria-purple/50 transition-colors"
        />
        <button
          type="submit"
          className="shrink-0 px-3 py-2 bg-aria-purple hover:bg-aria-purple/80 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}
