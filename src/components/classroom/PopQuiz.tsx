'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowser } from '@/services/supabase/client';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface PopQuizProps {
  sessionId: string;
  appUserId: string;
  isTeacher?: boolean;
}

export default function PopQuiz({ sessionId, appUserId, isTeacher = false }: PopQuizProps) {
  const [quiz, setQuiz] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowser(appUserId);

    const channel = supabase.channel(`quiz-${sessionId}`)
      .on('broadcast', { event: 'new_quiz' }, (payload) => {
        setQuiz(payload.payload.quiz);
        setAnswers({});
        setSubmitted(false);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, appUserId]);

  if (!quiz) return null;

  const handleSelect = (qIndex: number, option: string) => {
    if (submitted || isTeacher) return;
    setAnswers(prev => ({ ...prev, [qIndex]: option }));
  };

  const calculateScore = () => {
    let score = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    quiz.questions.forEach((q: any, i: number) => {
      if (answers[i] === q.correctAnswer) score++;
    });
    return score;
  };

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-heavy max-w-lg w-full rounded-2xl p-6 border border-aria-purple/30 shadow-2xl animate-in zoom-in-95 duration-300 relative">
        {/* Dismiss button for teacher or submitted student */}
        <button
          onClick={() => setQuiz(null)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Dismiss Quiz Modal"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-white tracking-tight">Pop Quiz!</h2>
            {isTeacher && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Teacher Monitor
              </span>
            )}
          </div>
          <p className="text-sm text-aria-purple-light">
            {isTeacher ? 'Live questions sent to students' : 'Based on what ARIA just explained'}
          </p>
        </div>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {quiz.questions.map((q: any, i: number) => (
            <div key={i} className="space-y-3">
              <p className="font-medium text-slate-200 text-sm">{i + 1}. {q.question}</p>
              <div className="space-y-2">
                {q.options.map((opt: string, j: number) => {
                  const isSelected = answers[i] === opt;
                  const isCorrect = opt === q.correctAnswer;
                  
                  let optStyle = 'border-surface-3 bg-surface-2 hover:border-aria-purple/50 cursor-pointer';
                  let icon = null;

                  if (isTeacher) {
                    if (isCorrect) {
                      optStyle = 'border-emerald-500/60 bg-emerald-500/15 text-emerald-100 font-medium';
                      icon = (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                          <CheckCircle className="w-4 h-4" />
                          <span>Correct</span>
                        </div>
                      );
                    } else {
                      optStyle = 'border-surface-3 bg-surface-1/40 text-slate-400 cursor-default';
                    }
                  } else if (submitted) {
                    if (isCorrect) {
                      optStyle = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-100';
                      icon = <CheckCircle className="w-4 h-4 text-emerald-400" />;
                    } else if (isSelected) {
                      optStyle = 'border-rose-500/50 bg-rose-500/10 text-rose-100';
                      icon = <XCircle className="w-4 h-4 text-rose-400" />;
                    } else {
                      optStyle = 'border-surface-3 bg-surface-1/50 opacity-50 cursor-not-allowed';
                    }
                  } else if (isSelected) {
                    optStyle = 'border-aria-purple bg-aria-purple/20 shadow-[0_0_15px_rgba(124,58,237,0.2)]';
                  }

                  return (
                    <div 
                      key={j} 
                      onClick={() => handleSelect(i, opt)}
                      className={`p-3 rounded-lg border text-sm transition-all duration-200 flex items-center justify-between ${optStyle}`}
                    >
                      <span>{opt}</span>
                      {icon}
                    </div>
                  );
                })}
              </div>
              {(isTeacher || (submitted && answers[i] !== q.correctAnswer)) && q.explanation && (
                <p className="text-xs text-slate-300 bg-black/40 p-2.5 rounded border border-surface-3">
                  <span className="text-emerald-400 font-semibold">Explanation:</span> {q.explanation}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          {isTeacher ? (
            <div className="text-xs text-amber-300">
              Students are currently answering this quiz
            </div>
          ) : submitted ? (
            <div className="text-sm font-semibold">
              Score: <span className={calculateScore() === quiz.questions.length ? 'text-emerald-400' : 'text-amber-400'}>{calculateScore()} / {quiz.questions.length}</span>
            </div>
          ) : (
            <div className="text-xs text-slate-400">Answer all questions to submit</div>
          )}
          
          <div className="flex gap-3">
            {isTeacher ? (
              <button 
                onClick={() => setQuiz(null)} 
                className="px-5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 rounded-lg text-sm font-medium transition-colors"
              >
                Close Quiz View
              </button>
            ) : submitted ? (
              <button onClick={() => setQuiz(null)} className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors">
                Close
              </button>
            ) : (
              <button 
                onClick={() => setSubmitted(true)}
                disabled={Object.keys(answers).length < quiz.questions.length}
                className="px-5 py-2 bg-aria-purple hover:bg-aria-purple-dark disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
              >
                Submit Answers
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
