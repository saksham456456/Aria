"use client";

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/services/supabase/client';
import { useRouter } from 'next/navigation';

export default function SummaryView({ sessionId, appUserId }: { sessionId: string; appUserId: string }) {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classroom, setClassroom] = useState<{name: string, join_code: string} | null>(null);

  useEffect(() => {
    async function init() {
      setLoading(true);
      setError(null);

      try {
        // Fetch classroom details for header and copy code
        const { data: sessionData } = await supabaseBrowser
          .from('sessions')
          .select('classrooms(name, join_code)')
          .eq('id', sessionId)
          .single();

        if (sessionData?.classrooms && !Array.isArray(sessionData.classrooms)) {
           setClassroom(sessionData.classrooms as {name: string, join_code: string});
        }

        // Trigger generation (idempotent, returns cached if exists)
        const res = await fetch('/api/summary', {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
             'x-user-id': appUserId,
           },
           body: JSON.stringify({ sessionId }),
        });

        const json = await res.json();

        if (!res.ok || !json.success) {
           throw new Error(json.error?.message || 'Failed to generate summary');
        }

        setSummary(json.data.summary);
      } catch (err: unknown) {
         console.error('Summary error:', err);
         setError(err instanceof Error ? err.message : String(err));
      } finally {
         setLoading(false);
      }
    }

    init();
  }, [sessionId, appUserId]);

  const handleCopyCode = () => {
    if (classroom?.join_code) {
      navigator.clipboard.writeText(classroom.join_code);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-1 p-6 rounded-xl border border-surface-3 shadow-lg">
          <div>
             <h1 className="text-2xl font-bold text-gray-100">
               Class ended <span className="text-gray-500 mx-2">&middot;</span> <span className="text-aria-purple-light">{classroom?.name || 'Classroom'}</span>
             </h1>
          </div>
          {classroom?.join_code && (
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-2 px-4 py-2 bg-surface-2 hover:bg-surface-3 rounded-lg text-sm font-medium border border-surface-3 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              Copy Code: {classroom.join_code}
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-surface-1 rounded-xl border border-surface-3">
             <div className="w-12 h-12 border-4 border-surface-3 border-t-aria-purple rounded-full animate-spin mb-4"></div>
             <p className="text-gray-400 animate-pulse">Analyzing transcript and generating insights...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-xl text-center">
             <div className="text-live-red text-4xl mb-4">⚠️</div>
             <h3 className="text-lg font-bold text-red-400 mb-2">Summary Generation Failed</h3>
             <p className="text-red-300/80 mb-6">{error}</p>
             <button
               onClick={() => window.location.reload()}
               className="px-6 py-2.5 bg-live-red hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
             >
               Retry Summary
             </button>
          </div>
        ) : summary ? (
          <div className="space-y-6">
             {/* Cards */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Overview (Spans 2 cols on md) */}
                <div className="md:col-span-2 bg-surface-1 p-6 rounded-xl border border-surface-3">
                   <h2 className="flex items-center gap-2 text-lg font-bold mb-4 text-gray-200">
                     <span>📋</span> Overview
                   </h2>
                   <p className="text-gray-300 leading-relaxed text-sm">{summary.overview}</p>
                </div>

                {/* Stats */}
                <div className="bg-surface-1 p-6 rounded-xl border border-surface-3 flex flex-col justify-center items-center text-center">
                   <div className="text-4xl font-bold text-aria-purple mb-2">{summary.aria_interventions_count || 0}</div>
                   <div className="text-sm text-gray-400 font-medium">ARIA Interventions</div>
                </div>

                {/* Topics Covered */}
                <div className="md:col-span-3 bg-surface-1 p-6 rounded-xl border border-surface-3">
                   <h2 className="flex items-center gap-2 text-lg font-bold mb-4 text-gray-200">
                     <span>📚</span> Topics Covered
                   </h2>
                   <div className="flex flex-wrap gap-2">
                      {summary.topics_covered?.map((t: string, i: number) => (
                        <span key={i} className="px-3 py-1.5 bg-surface-2 border border-surface-3 rounded-full text-xs font-medium text-gray-300">
                           {t}
                        </span>
                      ))}
                   </div>
                </div>

                {/* Learning Gaps */}
                <div className="md:col-span-3 bg-surface-1 p-6 rounded-xl border border-surface-3">
                   <h2 className="flex items-center gap-2 text-lg font-bold mb-4 text-gray-200">
                     <span>⚠️</span> Learning Gaps
                   </h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {summary.common_learning_gaps?.map((g: any, i: number) => (
                         <div key={i} className="bg-surface-0 p-4 rounded-lg border border-surface-2">
                            <strong className="block text-aria-purple-light mb-2">{g.concept}</strong>
                            <p className="text-sm text-gray-400 mb-4">{g.description}</p>

                            {g.affectedStudents && g.affectedStudents.length > 0 && (
                               <div className="mb-3 flex flex-wrap gap-1">
                                  {g.affectedStudents.map((s: string, j: number) => (
                                     <span key={j} className="text-xs bg-role-student/20 text-role-student px-2 py-0.5 rounded">
                                        {s}
                                     </span>
                                  ))}
                               </div>
                            )}

                            <div className="text-sm bg-surface-2 p-3 rounded border border-surface-3 text-gray-300">
                               <strong className="text-gray-400 mr-2">Recommendation:</strong>
                               {g.recommendation}
                            </div>
                         </div>
                      ))}
                      {(!summary.common_learning_gaps || summary.common_learning_gaps.length === 0) && (
                         <div className="text-gray-500 text-sm italic">No significant learning gaps identified.</div>
                      )}
                   </div>
                </div>

                {/* Student Insights */}
                <div className="md:col-span-3 bg-surface-1 p-6 rounded-xl border border-surface-3">
                   <h2 className="flex items-center gap-2 text-lg font-bold mb-4 text-gray-200">
                     <span>👤</span> Student Insights
                   </h2>
                   <div className="space-y-4">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {summary.student_insights?.map((s: any, i: number) => (
                         <div key={i} className="bg-surface-0 p-4 rounded-lg border border-surface-2 flex flex-col md:flex-row gap-4">
                            <div className="md:w-1/4">
                               <strong className="text-lg">{s.studentName}</strong>
                            </div>
                            <div className="md:w-3/4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                               <div>
                                  <strong className="text-connected-green mb-1 block">Strengths</strong>
                                  <ul className="list-disc pl-4 text-gray-400 space-y-1">
                                     {s.strengths?.map((str: string, j: number) => <li key={j}>{str}</li>)}
                                  </ul>
                               </div>
                               <div>
                                  <strong className="text-warning-amber mb-1 block">Needs Support</strong>
                                  <ul className="list-disc pl-4 text-gray-400 space-y-1">
                                     {s.needsSupport?.map((ns: string, j: number) => <li key={j}>{ns}</li>)}
                                  </ul>
                               </div>
                            </div>
                         </div>
                      ))}
                      {(!summary.student_insights || summary.student_insights.length === 0) && (
                         <div className="text-gray-500 text-sm italic">No individual student insights generated.</div>
                      )}
                   </div>
                </div>

                {/* Recommendations */}
                <div className="md:col-span-3 bg-surface-1 p-6 rounded-xl border border-surface-3">
                   <h2 className="flex items-center gap-2 text-lg font-bold mb-4 text-gray-200">
                     <span>💡</span> General Recommendations
                   </h2>
                   <p className="text-gray-300 leading-relaxed text-sm">{summary.recommendations}</p>
                </div>
             </div>
          </div>
        ) : null}

        {/* Footer */}
        <div className="pt-6 flex justify-center">
           <button
             onClick={() => router.push('/')}
             className="px-8 py-3 bg-surface-2 hover:bg-surface-3 border border-surface-3 text-white rounded-xl font-semibold transition-colors"
           >
             Back to Home
           </button>
        </div>

      </div>
    </div>
  );
}
