import { useEffect, useRef } from 'react';
import { Message } from '@/types/session';

interface ChatPanelProps {
  messages: Message[];
  localRole: string;
  onSendMessage: (text: string) => void;
  onClose: () => void;
}

export default function ChatPanel({ messages, localRole, onSendMessage, onClose }: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const text = formData.get('text') as string;

    if (text?.trim()) {
      onSendMessage(text.trim());
      form.reset();
    }
  };

  return (
    <div className="w-full sm:w-80 border-l border-surface-3 bg-surface-1 flex flex-col h-full text-white absolute sm:relative z-20">
      <div className="p-4 border-b border-surface-3 flex justify-between items-center">
        <h2 className="font-bold">Chat</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.length === 0 && (
          <div className="h-full flex items-center justify-center text-gray-500 text-sm">
            No messages yet. Say hello!
          </div>
        )}

        {messages?.map((m) => {
          const isMe = m.role === localRole && m.role !== 'aria'; // Simplified 'isMe' logic for prototype

          if (m.role === 'aria') {
            return (
              <div key={m.id} className="flex justify-center my-4">
                <div className="bg-aria-purple/20 border border-aria-purple/40 text-gray-100 p-3 rounded-xl max-w-[90%] text-sm shadow-sm relative text-center">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-aria-purple text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider">
                    ARIA
                  </div>
                  {m.text}
                </div>
              </div>
            );
          }

          return (
            <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-gray-400">{m.sender_name}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider
                  ${m.role === 'teacher' ? 'bg-role-teacher/20 text-role-teacher' : 'bg-role-student/20 text-role-student'}`}
                >
                  {m.role}
                </span>
              </div>
              <div className={`p-3 rounded-2xl max-w-[90%] text-sm shadow-sm
                ${isMe
                  ? 'bg-aria-purple text-white rounded-tr-sm'
                  : 'bg-surface-2 text-gray-200 border border-surface-3 rounded-tl-sm'}`}
              >
                {m.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-surface-3 bg-surface-1">
        <form onSubmit={handleSubmit} className="flex gap-2 relative">
          <input
            name="text"
            autoComplete="off"
            className="w-full bg-surface-2 border border-surface-3 text-white placeholder-gray-500 p-2.5 pr-10 rounded-lg focus:outline-none focus:border-aria-purple focus:ring-1 focus:ring-aria-purple transition-colors text-sm"
            placeholder="Type a message..."
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-aria-purple transition-colors p-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </form>
      </div>
    </div>
  );
}
