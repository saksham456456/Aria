"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function JoinClassroomForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      joinCode: (formData.get('joinCode') as string)?.toUpperCase(),
      name: formData.get('name'),
      learningLevel: formData.get('learningLevel'),
      language: formData.get('language'),
    };

    let appUserId = localStorage.getItem('aria_user_id');
    if (!appUserId) {
      appUserId = crypto.randomUUID();
      localStorage.setItem('aria_user_id', appUserId);
    }

    try {
      const res = await fetch('/api/session/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': appUserId,
        },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error.message);
      }

      router.push(`/room/${json.data.sessionId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md mx-auto p-6 sm:p-8 bg-surface-1 rounded-xl shadow-lg border border-surface-3">
      <h2 className="text-2xl font-bold mb-6 text-white text-center">Join Classroom</h2>

      {error && <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm">{error}</div>}

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Classroom Code</label>
          <input name="joinCode" required maxLength={6} className="w-full bg-surface-2 border border-surface-3 rounded-lg p-3 text-white uppercase tracking-widest font-mono focus:outline-none focus:border-aria-purple focus:ring-1 focus:ring-aria-purple transition-colors" placeholder="e.g. M7K4P2" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Your Name</label>
          <input name="name" required className="w-full bg-surface-2 border border-surface-3 rounded-lg p-3 text-white focus:outline-none focus:border-aria-purple focus:ring-1 focus:ring-aria-purple transition-colors" placeholder="e.g. Alice" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Learning Level</label>
          <select name="learningLevel" className="w-full bg-surface-2 border border-surface-3 rounded-lg p-3 text-white focus:outline-none focus:border-aria-purple focus:ring-1 focus:ring-aria-purple transition-colors appearance-none">
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Preferred Language</label>
          <select name="language" className="w-full bg-surface-2 border border-surface-3 rounded-lg p-3 text-white focus:outline-none focus:border-aria-purple focus:ring-1 focus:ring-aria-purple transition-colors appearance-none">
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="en+hi">English + Hindi</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-6 py-3 px-4 rounded-lg font-bold text-white bg-transparent border-2 border-surface-3 hover:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-1 focus:ring-surface-3 disabled:opacity-50 transition-all flex justify-center items-center gap-2"
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        )}
        {loading ? 'Joining...' : 'Join Class'}
      </button>
    </form>
  );
}
