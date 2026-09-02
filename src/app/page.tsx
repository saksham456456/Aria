import Link from 'next/link';

const FEATURES = [
  { icon: '🎙️', title: 'Real-time Voice', desc: 'AI joins the call and speaks naturally via Agora RTC' },
  { icon: '🧠', title: 'Gap Detection', desc: 'Identifies struggling students and common misconceptions' },
  { icon: '📝', title: 'Live Transcript', desc: 'Captures every word for context-aware AI responses' },
  { icon: '🌍', title: 'Multilingual', desc: 'Responds in English, Hindi, or code-switched naturally' },
  { icon: '📊', title: 'Post-Class Report', desc: 'Detailed summary with student insights and recommendations' },
  { icon: '🎯', title: 'Smart Quizzes', desc: 'AI generates targeted questions to check understanding' },
];

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-surface-0 text-white relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.1) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(124,58,237,0.15),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_100%,rgba(59,130,246,0.06),transparent)]" />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-20 space-y-16">
        {/* Hero */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-aria-purple to-aria-purple-light flex items-center justify-center shadow-2xl shadow-aria-purple/30 ring-1 ring-white/10">
              <span className="text-white text-3xl font-black tracking-tighter">AI</span>
            </div>
          </div>
          <div>
            <h1 className="text-7xl sm:text-8xl font-black tracking-tight">
              <span className="bg-gradient-to-br from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">ARIA</span>
            </h1>
            <p className="text-2xl sm:text-3xl font-bold text-slate-300 mt-2">Voice AI Co-Teacher</p>
          </div>
          <p className="text-slate-400 text-lg leading-relaxed max-w-xl mx-auto">
            The classroom&apos;s third voice — an AI that listens to your lesson in real-time,
            waits for the right moment, and helps students without interrupting you.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/classroom/create"
              className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-aria-purple to-aria-purple-light hover:opacity-90 text-white font-bold rounded-2xl text-base transition-all shadow-xl shadow-aria-purple/25 hover:shadow-aria-purple/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              Create Classroom
            </Link>
            <Link
              href="/classroom/join"
              className="w-full sm:w-auto px-10 py-4 bg-surface-1 hover:bg-surface-2 text-white font-bold rounded-2xl text-base border border-surface-3 hover:border-slate-500 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Join Classroom
            </Link>
          </div>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <div key={f.title} className="group p-5 rounded-2xl bg-surface-1/60 border border-surface-3 hover:border-aria-purple/30 hover:bg-surface-1 transition-all duration-300">
              <span className="text-2xl mb-3 block">{f.icon}</span>
              <h3 className="text-white font-bold text-sm mb-1">{f.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Footer tagline */}
        <div className="text-center">
          <p className="text-slate-600 text-xs">
            Built with Agora RTC · Groq LLaMA · ElevenLabs · Supabase
          </p>
        </div>
      </div>
    </main>
  );
}
