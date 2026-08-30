/* eslint-disable @typescript-eslint/no-explicit-any */
export default function ChatPanel({ messages, onSendMessage, onClose }: any) {
  return <div className="w-80 border-l border-gray-700 bg-gray-800 flex flex-col h-full text-white">
     <div className="p-4 border-b border-gray-700 flex justify-between">
        <h2 className="font-bold">Chat</h2>
        <button onClick={onClose}>&times;</button>
     </div>
     <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.map((m: any) => <div key={m.id} className="text-sm"><span className="font-bold">{m.sender_name}:</span> {m.text}</div>)}
     </div>
     <div className="p-4 border-t border-gray-700">
        <form onSubmit={(e) => { e.preventDefault(); const t = (e.target as any).text.value; if(t) { onSendMessage(t); (e.target as any).reset(); } }}>
           <input name="text" className="w-full bg-gray-700 p-2 rounded" placeholder="Type a message..." />
        </form>
     </div>
  </div>;
}
