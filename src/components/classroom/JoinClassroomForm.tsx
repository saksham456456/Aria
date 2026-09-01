'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const INPUT_CLS = 'w-full bg-surface-2 border border-surface-3 focus:border-aria-purple/50 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition-colors';
const LABEL_CLS = 'block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5';

export default function JoinClassroomForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let appUserId = localStorage.getItem('aria_user_id');
    if (!appUserId) {
      appUserId = crypto.randomUUID();
      localStorage.setItem('aria_user_id', appUserId);
    }

    const formData = new FormData(e.currentTarget);
    const rawCode  = (formData.get('joinCode') as string ?? '').toUpperCase().trim();

    try {
      const res = await fetch('/api/session/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': appUserId },
        body: JSON.stringify({
          joinCode:      rawCode,
          name:          formData.get('name'),
          learningLevel: formData.get('learningLevel'),
          language:      formData.get('language'),
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error.message);
      router.push(`/room/${json.data.sessionId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-surface-1 border border-surface-3 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Join Classroom</h2>

        {error && (
          <div className="mb-4 p-3 bg-live-red/10 border border-live-red/30 rounded-xl text-live-red text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={LABEL_CLS}>Classroom Code</label>
            <input
              name="joinCode" required maxLength={6}
              className={INPUT_CLS + ' uppercase font-mono tracking-[0.3em] text-center text-lg'}
              placeholder="M7K4P2"
              onChange={e => { e.currentTarget.value = e.currentTarget.value.toUpperCase(); }}
            />
          </div>
          <div>
            <label className={LABEL_CLS}>Your Name</label>
            <input name="name" required className={INPUT_CLS} placeholder="e.g. Priya" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLS}>Level</label>
              <select name="learningLevel" className={INPUT_CLS}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLS}>Language</label>
              <select name="language" className={INPUT_CLS}>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="en+hi">Both</option>
              </select>
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full py-3 bg-role-student hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Joining…
              </>
            ) : 'Join Class'}
          </button>
        </form>
      </div>
    </div>
  );
}
