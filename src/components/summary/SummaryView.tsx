/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/services/supabase/client';
import { useRouter } from 'next/navigation';

export default function SummaryView({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTeacher, setIsTeacher] = useState(false);
  const [appUserId, setAppUserId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('aria_user_id');
    setAppUserId(id);
  }, []);

  useEffect(() => {
    if (!appUserId) return;

    async function fetchSummary() {
      setLoading(true);
      setError(null);

      const { data: pData } = await supabaseBrowser
        .from('participants')
        .select('role')
        .eq('session_id', sessionId)
        .eq('app_user_id', appUserId!)
        .single();

      setIsTeacher(pData?.role === 'teacher');

      const { data, error } = await supabaseBrowser
        .from('session_summaries')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (error && error.code !== 'PGRST116') {
        setError(error.message);
      } else if (data) {
        setSummary(data);
      }
      setLoading(false);
    }

    fetchSummary();
  }, [sessionId, appUserId]);

  const generateSummary = async () => {
     setLoading(true);
     setError(null);
     try {
        const res = await fetch('/api/summary', {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
             'x-user-id': appUserId!,
           },
           body: JSON.stringify({ sessionId }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error.message);

        // refetch
        const { data } = await supabaseBrowser.from('session_summaries').select('*').eq('session_id', sessionId).single();
        if (data) setSummary(data);
     } catch (e: any) {
        setError(e.message);
     } finally {
        setLoading(false);
     }
  };

  if (loading) return <div className="p-8 text-center">Loading summary...</div>;

  if (!summary) {
     return (
       <div className="p-8 max-w-2xl mx-auto text-center">
         <h2 className="text-2xl font-bold mb-4">Class has ended</h2>
         <p className="mb-8">No summary available yet.</p>
         {isTeacher && (
            <button onClick={generateSummary} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
               Generate Summary
            </button>
         )}
         {error && <p className="text-red-500 mt-4">{error}</p>}

         <div className="mt-8"><button onClick={() => router.push('/')} className="text-blue-600 underline">Return Home</button></div>
       </div>
     );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 bg-white text-gray-900 rounded-lg shadow mt-8">
      <h1 className="text-3xl font-bold border-b pb-4">Session Summary</h1>

      <section>
        <h2 className="text-xl font-bold mb-2">Overview</h2>
        <p>{summary.overview}</p>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-2">Topics Covered</h2>
        <ul className="list-disc pl-5">
           {summary.topics_covered?.map((t: string, i: number) => <li key={i}>{t}</li>)}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-2">Learning Gaps</h2>
        {summary.common_learning_gaps?.map((g: any, i: number) => (
           <div key={i} className="mb-4 bg-gray-50 p-4 rounded border">
              <strong className="block mb-1">{g.concept}</strong>
              <p className="text-sm text-gray-700 mb-2">{g.description}</p>
              <div className="text-sm"><strong>Recommendation:</strong> {g.recommendation}</div>
           </div>
        ))}
      </section>

      <div className="mt-8 text-center border-t pt-8">
         <button onClick={() => router.push('/')} className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded text-black font-medium">Return Home</button>
      </div>
    </div>
  );
}
