'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowser } from '@/services/supabase/client';
import { CheckCircle, XCircle } from 'lucide-react';

interface PopQuizProps {
  sessionId: string;
  appUserId: string;
  isTeacher?: boolean;
  previewQuiz?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  onCancelPreview?: () => void;
  onApprovePreview?: () => void;
  studentName?: string;
}

export default function PopQuiz({ sessionId, appUserId, isTeacher, previewQuiz, onCancelPreview, onApprovePreview, studentName }: PopQuizProps) {
  const [quiz, setQuiz] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submittingResult, setSubmittingResult] = useState(false);

  useEffect(() => {
    if (previewQuiz) {
      setQuiz(previewQuiz);
      return;
    }

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
  }, [sessionId, appUserId, previewQuiz]);

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

  const handleSubmit = async () => {
    if (isTeacher) return;
    setSubmitted(true);
    setSubmittingResult(true);

    const score = calculateScore();
    const total = quiz.questions.length;

    try {
      await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': appUserId },
        body: JSON.stringify({
          sessionId,
          studentName: studentName || 'A Student',
          score,
          total
        }),
      });
    } catch (err) {
      console.error('Failed to submit quiz score', err);
    } finally {
      setSubmittingResult(false);
    }
  };

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-heavy max-w-lg w-full rounded-2xl p-6 border border-aria-purple/30 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white tracking-tight">
            {isTeacher ? 'Review AI Quiz' : 'Pop Quiz!'}
          </h2>
          <p className="text-sm text-aria-purple-light mt-1">
            {isTeacher ? 'Approve this generated quiz to send to all students' : 'Answer all questions to continue'}
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
                      optStyle = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-100';
                      icon = <CheckCircle className="w-4 h-4 text-emerald-400" />;
                    } else {
                      optStyle = 'border-surface-3 bg-surface-1/50 opacity-50 cursor-default';
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
              {((submitted && answers[i] !== q.correctAnswer) || isTeacher) && (
                <p className="text-xs text-slate-400 bg-black/40 p-2 rounded border border-surface-3">
                  <span className="text-emerald-400 font-semibold">Explanation:</span> {q.explanation}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          {isTeacher ? (
            <div className="text-xs text-slate-400">Preview Mode</div>
          ) : submitted ? (
            <div className="text-sm font-semibold">
              Score: <span className={calculateScore() === quiz.questions.length ? 'text-emerald-400' : 'text-amber-400'}>{calculateScore()} / {quiz.questions.length}</span>
            </div>
          ) : (
            <div className="text-xs text-slate-400">Answer all questions to submit</div>
          )}
          
          <div className="flex gap-3">
            {isTeacher ? (
              <>
                <button onClick={onCancelPreview} className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors">
                  Cancel
                </button>
                <button onClick={onApprovePreview} className="px-5 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-sm font-medium transition-colors">
                  Approve & Broadcast
                </button>
              </>
            ) : submitted ? (
              <button 
                onClick={() => setQuiz(null)} 
                disabled={submittingResult}
                className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {submittingResult ? 'Publishing...' : 'Close'}
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
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
