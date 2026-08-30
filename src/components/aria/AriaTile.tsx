/* eslint-disable @typescript-eslint/no-explicit-any */
export default function AriaTile({ state }: any) {
  return <div className="bg-gray-800 flex flex-col items-center justify-center rounded-lg border-2 border-purple-500 relative overflow-hidden h-full min-h-[200px]">
     <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center text-2xl mb-4 animate-pulse">
        AI
     </div>
     <div className="text-white font-medium">ARIA Co-Teacher</div>
     <div className="text-purple-300 text-sm mt-2">{state || 'Listening...'}</div>
  </div>;
}
