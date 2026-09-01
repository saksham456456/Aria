'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type FormState = 'idle' | 'loading' | 'success';

const INPUT_CLS = 'w-full bg-surface-2 border border-surface-3 focus:border-aria-purple/50 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition-colors';
const LABEL_CLS = 'block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5';

export default function CreateClassroomForm() {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>('idle');
  const [error, setError]         = useState('');
  const [joinCode, setJoinCode]   = useState('');
  const [sessionId, setSessionId] = useState('');
  const [copied, setCopied]       = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState('loading');
    setError('');

    let appUserId = localStorage.getItem('aria_user_id');
    if (!appUserId) {
      appUserId = crypto.randomUUID();
      localStorage.setItem('aria_user_id', appUserId);
    }

    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/session/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': appUserId },
        body: JSON.stringify({
          name:              formData.get('name'),
          subject:           formData.get('subject'),
          topic:             formData.get('topic'),
          grade:             formData.get('grade'),
          lessonDescription: formData.get('lessonDescription'),
          teacherName:       formData.get('teacherName'),
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error.message);
      setJoinCode(json.data.joinCode);
      setSessionId(json.data.sessionId);
      setFormState('success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setFormState('idle');
    }
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Success screen — show join code before entering room ─────────────────
  if (formState === 'success') {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-surface-1 border border-surface-3 rounded-2xl p-8 text-center space-y-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-connected-green/10 border border-connected-green/30 mx-auto">
            <svg className="w-6 h-6 text-connected-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-connected-green text-sm font-semibold mb-1">Class created!</p>
            <p className="text-slate-400 text-sm">Share this code with your students:</p>
          </div>

          <div className="bg-surface-2 border border-surface-3 rounded-xl p-5">
            <p className="text-4xl font-mono font-bold text-white tracking-[0.25em] mb-3">{joinCode}</p>
            <button
              onClick={copyCode}
              className={`text-sm font-medium px-4 py-2 rounded-lg border transition-colors ${
                copied
                  ? 'bg-connected-green/10 border-connected-green/30 text-connected-green'
                  : 'bg-surface-3 border-surface-3 text-slate-300 hover:text-white hover:border-slate-500'
              }`}
            >
              {copied ? '✓ Copied!' : 'Copy code'}
            </button>
          </div>

          <button
            onClick={() => router.push(`/room/${sessionId}`)}
            className="w-full py-3 bg-aria-purple hover:bg-aria-purple/80 text-white font-semibold rounded-xl text-sm transition-colors"
          >
            Enter Classroom →
          </button>
        </div>
      </div>
    );
  }

  // ── Create form ──────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-surface-1 border border-surface-3 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Create Classroom</h2>

        {error && (
          <div className="mb-4 p-3 bg-live-red/10 border border-live-red/30 rounded-xl text-live-red text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={LABEL_CLS}>Your Name</label>
            <input name="teacherName" required className={INPUT_CLS} placeholder="e.g. Dr. Sharma" />
          </div>
          <div>
            <label className={LABEL_CLS}>Class Name</label>
            <input name="name" required className={INPUT_CLS} placeholder="e.g. Grade 7 Mathematics" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLS}>Subject</label>
              <input name="subject" required className={INPUT_CLS} placeholder="e.g. Maths" />
            </div>
            <div>
              <label className={LABEL_CLS}>Grade / Level</label>
              <input name="grade" required className={INPUT_CLS} placeholder="e.g. Grade 7" />
            </div>
          </div>
          <div>
            <label className={LABEL_CLS}>Today&apos;s Topic</label>
            <input name="topic" required className={INPUT_CLS} placeholder="e.g. Equivalent Fractions" />
          </div>
          <div>
            <label className={LABEL_CLS}>Lesson Description</label>
            <textarea
              name="lessonDescription" required rows={3}
              className={INPUT_CLS + ' resize-none'}
              placeholder="What you'll be teaching today — ARIA uses this context…"
            />
          </div>

          <button
            type="submit"
            disabled={formState === 'loading'}
            className="w-full py-3 bg-aria-purple hover:bg-aria-purple/80 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            {formState === 'loading' ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Creating…
              </>
            ) : 'Create Class'}
          </button>
        </form>
      </div>
    </div>
  );
}
