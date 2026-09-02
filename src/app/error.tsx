'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Router Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-0 text-white relative overflow-hidden px-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-live-red/20 border border-live-red/40 flex items-center justify-center mx-auto text-live-red text-2xl font-bold">
          !
        </div>
        <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          {error.message || 'An unexpected error occurred during classroom session.'}
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center justify-center px-6 py-3 bg-surface-1 hover:bg-surface-2 border border-surface-3 hover:border-slate-500 text-white font-bold rounded-xl text-sm transition-all"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
