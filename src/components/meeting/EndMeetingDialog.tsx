'use client';

interface EndMeetingDialogProps {
  isOpen:     boolean;
  onConfirm:  () => void;
  onCancel:   () => void;
}

export default function EndMeetingDialog({ isOpen, onConfirm, onCancel }: EndMeetingDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-1 border border-surface-3 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-live-red/10 border border-live-red/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-live-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white">End class?</h2>
        </div>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          This will end the session for <strong className="text-white">all participants</strong>. ARIA will generate a post-session summary.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-surface-2 border border-surface-3 hover:border-slate-500 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-live-red hover:bg-red-500 rounded-xl transition-colors"
          >
            End class
          </button>
        </div>
      </div>
    </div>
  );
}
