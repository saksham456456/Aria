import React, { useState } from 'react';
import { ChatMessage } from '@/types/meeting';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onClose: () => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, onClose }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text);
    setText('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-surface-3 flex items-center justify-between">
        <h2 className="font-semibold text-sm text-white">In-Call Messages</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white text-lg">×</button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((m) => (
          <div key={m.id} className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold ${
                m.role === 'teacher' ? 'text-role-teacher' : m.role === 'aria' ? 'text-aria-purple-light' : 'text-role-student'
              }`}>
                {m.sender_name}
              </span>
              <span className="text-[10px] text-gray-500">
                {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className={`mt-1 text-xs p-2.5 rounded-xl ${
              m.role === 'aria' ? 'bg-aria-purple-dim/30 border border-aria-purple/40 text-gray-200' : 'bg-surface-2 text-gray-300'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-surface-3 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Send a message to everyone..."
          className="flex-1 bg-surface-2 border border-surface-3 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-aria-purple"
        />
        <button type="submit" className="px-4 py-2 bg-aria-purple hover:bg-aria-purple-light text-white rounded-xl text-xs font-medium transition-colors">
          Send
        </button>
      </form>
    </div>
  );
};
