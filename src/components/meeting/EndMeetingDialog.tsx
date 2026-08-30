/* eslint-disable @typescript-eslint/no-explicit-any */
export default function EndMeetingDialog({ isOpen, onConfirm, onCancel }: any) {
  if (!isOpen) return null;
  return <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
     <div className="bg-white p-6 rounded-lg text-black max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4">End Class?</h2>
        <p className="mb-6">This will end the session for all participants.</p>
        <div className="flex justify-end gap-4">
           <button onClick={onCancel} className="px-4 py-2 border rounded">Cancel</button>
           <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded">End Class</button>
        </div>
     </div>
  </div>;
}
