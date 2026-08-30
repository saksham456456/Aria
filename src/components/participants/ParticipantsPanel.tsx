/* eslint-disable @typescript-eslint/no-explicit-any */
export default function ParticipantsPanel({ participants, onClose }: any) {
  return <div className="w-80 border-l border-gray-700 bg-gray-800 flex flex-col h-full text-white">
     <div className="p-4 border-b border-gray-700 flex justify-between">
        <h2 className="font-bold">People</h2>
        <button onClick={onClose}>&times;</button>
     </div>
     <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {participants?.map((p: any) => <div key={p.id} className="text-sm">{p.name} ({p.role})</div>)}
     </div>
  </div>;
}
