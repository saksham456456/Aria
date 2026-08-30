"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateClassroomForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<{ sessionId: string; joinCode: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      subject: formData.get('subject'),
      topic: formData.get('topic'),
      grade: formData.get('grade'),
      lessonDescription: formData.get('lessonDescription'),
      teacherName: formData.get('teacherName'),
    };

    let appUserId = localStorage.getItem('aria_user_id');
    if (!appUserId) {
      appUserId = crypto.randomUUID();
      localStorage.setItem('aria_user_id', appUserId);
    }

    try {
      const res = await fetch('/api/session/create', {
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

      setSuccessData({
        sessionId: json.data.sessionId,
        joinCode: json.data.joinCode
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (successData?.joinCode) {
      navigator.clipboard.writeText(successData.joinCode);
    }
  };

  if (successData) {
    return (
      <div className="space-y-6 w-full max-w-md mx-auto p-8 bg-surface-1 rounded-xl shadow-lg border border-surface-3 text-center">
        <div className="w-16 h-16 bg-connected-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
           <svg className="w-8 h-8 text-connected-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h2 className="text-2xl font-bold text-white">Class created!</h2>

        <p className="text-gray-400">Share this code with your students:</p>

        <div className="flex items-center justify-center gap-3 my-6">
          <div className="px-6 py-3 bg-surface-2 border border-surface-3 rounded-lg text-3xl font-mono tracking-widest text-aria-purple-light font-bold">
            {successData.joinCode}
          </div>
          <button
            onClick={handleCopyCode}
            className="p-3 bg-surface-2 hover:bg-surface-3 border border-surface-3 rounded-lg text-gray-300 hover:text-white transition-colors"
            title="Copy Code"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          </button>
        </div>

        <button
          onClick={() => router.push(`/room/${successData.sessionId}`)}
          className="w-full py-3 px-4 rounded-lg font-bold text-white bg-aria-purple hover:bg-aria-purple-light transition-colors"
        >
          Enter Classroom &rarr;
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md mx-auto p-6 sm:p-8 bg-surface-1 rounded-xl shadow-lg border border-surface-3">
      <h2 className="text-2xl font-bold mb-6 text-white text-center">Create Classroom</h2>

      {error && <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm">{error}</div>}

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Class Name</label>
          <input name="name" required className="w-full bg-surface-2 border border-surface-3 rounded-lg p-3 text-white focus:outline-none focus:border-aria-purple focus:ring-1 focus:ring-aria-purple transition-colors" placeholder="e.g. Grade 7 Mathematics" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Subject</label>
          <input name="subject" required className="w-full bg-surface-2 border border-surface-3 rounded-lg p-3 text-white focus:outline-none focus:border-aria-purple focus:ring-1 focus:ring-aria-purple transition-colors" placeholder="e.g. Math" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Topic</label>
          <input name="topic" required className="w-full bg-surface-2 border border-surface-3 rounded-lg p-3 text-white focus:outline-none focus:border-aria-purple focus:ring-1 focus:ring-aria-purple transition-colors" placeholder="e.g. Equivalent Fractions" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Grade / Level</label>
          <input name="grade" required className="w-full bg-surface-2 border border-surface-3 rounded-lg p-3 text-white focus:outline-none focus:border-aria-purple focus:ring-1 focus:ring-aria-purple transition-colors" placeholder="e.g. 7th Grade" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Lesson Description</label>
          <textarea name="lessonDescription" required rows={3} className="w-full bg-surface-2 border border-surface-3 rounded-lg p-3 text-white focus:outline-none focus:border-aria-purple focus:ring-1 focus:ring-aria-purple transition-colors resize-none" placeholder="Briefly describe what you'll cover today..." />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Teacher Name</label>
          <input name="teacherName" required className="w-full bg-surface-2 border border-surface-3 rounded-lg p-3 text-white focus:outline-none focus:border-aria-purple focus:ring-1 focus:ring-aria-purple transition-colors" placeholder="e.g. Mr. Smith" />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-6 py-3 px-4 rounded-lg font-bold text-white bg-gradient-to-r from-aria-purple to-purple-500 hover:from-aria-purple-light hover:to-purple-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-1 focus:ring-aria-purple disabled:opacity-50 transition-all flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(124,58,237,0.3)]"
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        )}
        {loading ? 'Creating...' : 'Create Class'}
      </button>
    </form>
  );
}
