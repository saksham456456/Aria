import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-surface-0 text-white relative overflow-hidden px-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-aria-purple to-aria-purple-light flex items-center justify-center mx-auto shadow-lg shadow-aria-purple/30">
          <span className="text-white text-2xl font-black">404</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white">Page Not Found</h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          The classroom or page you are looking for does not exist or may have been moved.
        </p>
        <div>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-aria-purple to-aria-purple-light hover:opacity-90 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-aria-purple/20"
          >
            Return to Classroom Lobby
          </Link>
        </div>
      </div>
    </main>
  );
}
