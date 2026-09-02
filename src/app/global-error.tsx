'use client';
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="bg-surface-0 text-white min-h-screen flex flex-col items-center justify-center px-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-live-red/20 border border-live-red/40 flex items-center justify-center mx-auto text-live-red text-2xl font-bold">
            !
          </div>
          <h2 className="text-2xl font-bold text-white">Critical Application Error</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            {error.message || 'A critical error occurred. Please refresh or retry.'}
          </p>
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center px-6 py-3 bg-aria-purple hover:bg-aria-purple-light text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-aria-purple/20"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
