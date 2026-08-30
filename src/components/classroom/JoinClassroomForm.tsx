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
      joinCode: formData.get('joinCode'),
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
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold mb-4">Join Classroom</h2>

      {error && <div className="p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-gray-700">Classroom Code</label>
        <input name="joinCode" required maxLength={6} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border uppercase" placeholder="e.g. M7K4P2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Your Name</label>
        <input name="name" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Learning Level</label>
        <select name="learningLevel" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-white">
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Preferred Language</label>
        <select name="language" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-white">
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="en+hi">English + Hindi</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {loading ? 'Joining...' : 'Join Class'}
      </button>
    </form>
  );
}
