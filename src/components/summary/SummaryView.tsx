'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SessionSummary } from '@/types/session';
import { supabaseBrowser } from '@/services/supabase/client';

type ViewState = 'loading' | 'generating' | 'ready' | 'error' | 'no-access';

interface SummarySection {
  icon:     string;
  title:    string;
  color:    string;
  children: React.ReactNode;
}

function Card({ icon, title, color, children }: SummarySection) {
  return (
    <div className="bg-surface-1 border border-surface-3 rounded-2xl p-6">
      <div className={`flex items-center gap-2 mb-4 ${color}`}>
        <span className="text-lg">{icon}</span>
        <h3 className="font-semibold text-sm uppercase tracking-wide">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Chip({ text }: { text: string }) {
  return (
    <span className="inline-block bg-surface-2 border border-surface-3 text-slate-300 text-xs px-3 py-1 rounded-full">
      {text}
    </span>
  );
}

export default function SummaryView({ sessionId, appUserId }: { sessionId: string; appUserId: string }) {
  const router = useRouter();
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [summary,   setSummary]   = useState<SessionSummary | null>(null);
  const [isTeacher, setIsTeacher] = useState(false);
  const [error,     setError]     = useState('');
  const [timeLeft,  setTimeLeft]  = useState(150); // 2.5 minutes for students

  const fetchExistingSummary = useCallback(async () => {
    if (!appUserId) return { data: null, teacher: false };

    const { data: pData } = await supabaseBrowser
      .from('participants')
      .select('role')
      .eq('session_id', sessionId)
      .eq('app_user_id', appUserId)
      .single();

    const teacher = pData?.role === 'teacher';
    setIsTeacher(teacher);

    const { data } = await supabaseBrowser
      .from('session_summaries')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle();

    return { data: data as SessionSummary | null, teacher };
  }, [sessionId, appUserId]);

  const generateSummary = useCallback(async () => {
    setViewState('generating');
    setError('');
    try {
      const res = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': appUserId },
        body: JSON.stringify({ sessionId }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error.message);
      setSummary(json.data.summary as SessionSummary);
      setViewState('ready');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setViewState('error');
    }
  }, [sessionId, appUserId]);

  useEffect(() => {
    if (!appUserId) return; // Wait for appUserId to be loaded from localStorage

    (async () => {
      const { data: existing, teacher } = await fetchExistingSummary();
      if (existing) {
        setSummary(existing);
        setViewState('ready');
      } else if (teacher) {
        // Auto-generate if teacher and no summary exists yet
        await generateSummary();
      } else {
        // Students don't have access to GENERATE it, but they can view it if it exists.
        setViewState('no-access');
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appUserId, sessionId]);

  useEffect(() => {
    if (viewState !== 'ready' || isTeacher || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [viewState, isTeacher, timeLeft]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const BackButton = () => (
    <button
      onClick={() => router.push('/')}
      className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Back to Home
    </button>
  );

  if (viewState === 'loading' || viewState === 'generating') {
    return (
      <div className="min-h-screen bg-surface-0 flex flex-col items-center justify-center gap-4 text-white">
        <div className="w-10 h-10 border-2 border-aria-purple border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">
          {viewState === 'generating' ? 'Generating your session summary with ARIA…' : 'Loading summary…'}
        </p>
        <p className="text-slate-600 text-xs">This may take 10–20 seconds</p>
      </div>
    );
  }

  if (viewState === 'no-access') {
    return (
      <div className="min-h-screen bg-surface-0 flex items-center justify-center p-6 text-white">
        <div className="text-center max-w-sm">
          <p className="text-slate-400 mb-6 text-sm">The session summary hasn&apos;t been generated by the instructor yet. Please check back later!</p>
          <BackButton />
        </div>
      </div>
    );
  }

  if (viewState === 'error' || !summary) {
    return (
      <div className="min-h-screen bg-surface-0 flex items-center justify-center p-6 text-white">
        <div className="bg-surface-1 border border-surface-3 rounded-2xl p-8 max-w-sm w-full text-center space-y-4">
          <div className="text-live-red text-4xl">⚠</div>
          <h2 className="text-lg font-bold">Summary generation failed</h2>
          {error && <p className="text-slate-400 text-sm">{error}</p>}
          <div className="flex flex-col gap-2">
            {isTeacher && (
              <button
                onClick={generateSummary}
                className="w-full py-2.5 bg-aria-purple hover:bg-aria-purple/80 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Retry Summary
              </button>
            )}
            <BackButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-0 text-white">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-1">Session complete</p>
            <h1 className="text-3xl font-black tracking-tight">Class Summary</h1>
          </div>
          <div className="flex items-center gap-3">
            {isTeacher && (
              <button
                onClick={generateSummary}
                className="text-xs text-slate-400 hover:text-white border border-surface-3 hover:border-slate-500 px-3 py-2 rounded-xl transition-colors"
              >
                Regenerate
              </button>
            )}
            
            {!isTeacher && timeLeft > 0 ? (
              <div className="px-4 py-2 bg-surface-2 border border-surface-3 text-amber-400 rounded-xl text-sm font-semibold flex items-center gap-2">
                <span className="w-4 h-4 animate-spin border-2 border-amber-400 border-t-transparent rounded-full" />
                Review time: {formatTime(timeLeft)}
              </div>
            ) : (
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-aria-purple hover:bg-aria-purple/80 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Back to Home
              </button>
            )}
          </div>
        </div>

        {/* Overview */}
        {summary.overview && (
          <Card icon="📋" title="Overview" color="text-slate-300">
            <p className="text-slate-300 text-sm leading-relaxed">{summary.overview}</p>
          </Card>
        )}

        {/* Topics covered */}
        {summary.topics_covered?.length > 0 && (
          <Card icon="📚" title="Topics Covered" color="text-role-teacher">
            <div className="flex flex-wrap gap-2">
              {summary.topics_covered.map((t, i) => <Chip key={i} text={t} />)}
            </div>
          </Card>
        )}

        {/* Custom Key Points from Teacher's End Class prompt */}
        {summary.recommendations && summary.recommendations.length > 0 && (
          <Card icon="💡" title="Key Points & Takeaways" color="text-aria-purple-light">
            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
              {summary.recommendations}
            </div>
          </Card>
        )}
        
        {/* Footer */}
        <div className="pt-4 pb-10 text-center">
          {!isTeacher && timeLeft > 0 ? (
            <div className="inline-block px-6 py-3 bg-surface-1 border border-surface-3 text-slate-400 rounded-xl text-sm font-semibold">
              Please review the summary for {formatTime(timeLeft)} before leaving
            </div>
          ) : (
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-surface-1 hover:bg-surface-2 border border-surface-3 hover:border-slate-500 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              ← Back to Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
