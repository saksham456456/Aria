import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-surface-0 text-white relative overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.1) 1px,transparent 1px)', backgroundSize: '40px 40px' }}
      />
      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(124,58,237,0.08),transparent)]" />

      <div className="relative z-10 max-w-lg w-full text-center px-6 space-y-10">
        {/* Logo */}
        <div className="flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-aria-purple flex items-center justify-center shadow-lg shadow-aria-purple/30">
            <span className="text-white text-2xl font-black tracking-tighter">AI</span>
          </div>
        </div>

        {/* Hero text */}
        <div className="space-y-3">
          <h1 className="text-6xl font-black tracking-tight bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
            ARIA
          </h1>
          <p className="text-xl font-semibold text-slate-200">Co-Teacher</p>
          <p className="text-slate-400 text-base leading-relaxed max-w-sm mx-auto">
            The classroom&apos;s third voice — real-time AI that listens, adapts, and intervenes.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/classroom/create"
            className="w-full sm:w-auto px-8 py-3.5 bg-aria-purple hover:bg-aria-purple/80 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-aria-purple/20 hover:shadow-aria-purple/30"
          >
            Create Classroom
          </Link>
          <Link
            href="/classroom/join"
            className="w-full sm:w-auto px-8 py-3.5 bg-transparent hover:bg-surface-2 text-white font-semibold rounded-xl text-sm border border-surface-3 hover:border-slate-500 transition-all"
          >
            Join Classroom
          </Link>
        </div>

        {/* Feature chips */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {['Real-time voice', 'Gap detection', 'Live transcript', 'Post-session report'].map(f => (
            <span key={f} className="text-xs text-slate-500 bg-surface-2 border border-surface-3 px-3 py-1 rounded-full">
              {f}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
