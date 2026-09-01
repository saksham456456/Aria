'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/hooks/classroom/useChat';
import { Participant } from '@/types/session';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Send } from 'lucide-react';

interface ChatPanelProps {
  sessionId: string;
  appUserId: string;
  participants: Participant[];
  onClose: () => void;
}

export default function ChatPanel({ sessionId, appUserId, participants, onClose }: ChatPanelProps) {
  const { messages, sendMessage } = useChat(sessionId, appUserId);
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const me = participants.find(p => p.app_user_id === appUserId);
    if (me) {
      sendMessage(me.id, me.role, me.name, text);
    }

    setText('');
  };

  const getSenderName = (role: string, senderName: string) => {
    if (role === 'teacher') return `${senderName} (Teacher)`;
    if (role === 'aria') return 'ARIA ✨';
    return senderName;
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-200">
      <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-4">
        <h2 className="font-semibold text-sm">Class Chat</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-zinc-400 hover:text-zinc-100">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4" viewportRef={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg) => {
            const isMe = msg.participant_id && participants.find(p => p.id === msg.participant_id)?.app_user_id === appUserId;
            const isAria = msg.role === 'aria';

            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] text-zinc-500 mb-1 ml-1">
                  {getSenderName(msg.role, msg.sender_name)}
                </span>
                <div className={`px-3 py-2 rounded-2xl max-w-[85%] text-sm ${
                  isMe ? 'bg-blue-600 text-white rounded-br-sm' :
                  isAria ? 'bg-purple-600 text-white rounded-bl-sm' :
                  'bg-zinc-800 text-zinc-200 rounded-bl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-zinc-800 bg-zinc-950">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="bg-zinc-900 border-zinc-800 text-zinc-100"
          />
          <Button type="submit" size="icon" disabled={!text.trim()} className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
