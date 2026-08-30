/* eslint-disable @typescript-eslint/no-explicit-any */
export default function MeetingControls({ isMicEnabled, isCameraEnabled, onToggleMic, onToggleCamera, onToggleChat, onToggleParticipants, onToggleAria, isTeacher, onLeave }: any) {
  return <div className="p-4 bg-gray-800 border-t border-gray-700 flex justify-center gap-4 text-white">
     <button onClick={onToggleMic} className="px-4 py-2 bg-gray-700 rounded">{isMicEnabled ? 'Mute' : 'Unmute'}</button>
     <button onClick={onToggleCamera} className="px-4 py-2 bg-gray-700 rounded">{isCameraEnabled ? 'Stop Cam' : 'Start Cam'}</button>
     <button onClick={onToggleChat} className="px-4 py-2 bg-gray-700 rounded">Chat</button>
     <button onClick={onToggleParticipants} className="px-4 py-2 bg-gray-700 rounded">People</button>
     {isTeacher && <button onClick={onToggleAria} className="px-4 py-2 bg-purple-600 rounded">ARIA</button>}
     <button onClick={onLeave} className="px-4 py-2 bg-red-600 rounded">Leave</button>
  </div>;
}
