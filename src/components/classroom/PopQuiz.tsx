'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowser } from '@/services/supabase/client';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface PopQuizProps {
  sessionId: string;
  appUserId: string;
  isTeacher?: boolean;
  isOpen?: boolean;
  onCloseCreator?: () => void;
}

export default function PopQuiz({ sessionId, appUserId, isTeacher = false, isOpen = false, onCloseCreator }: PopQuizProps) {
  const [topic, setTopic] = useState('');
  const [generating, setGenerating] = useState(false);
  const [pendingQuiz, setPendingQuiz] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  const [activeQuiz, setActiveQuiz] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);



  useEffect(() => {
    const supabase = getSupabaseBrowser(appUserId);

    const channel = supabase.channel(`quiz-${sessionId}`, {
      config: { broadcast: { self: true } },
    })
      .on('broadcast', { event: 'new_quiz' }, (payload) => {
        setActiveQuiz(payload.payload.quiz);
        setAnswers({});
        setSubmitted(false);
        setPendingQuiz(null); // Clear pending if there was one
        if (onCloseCreator) onCloseCreator(); // Hide generation dialog when active
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, appUserId]);

  // If student and no quiz, don't show anything
  if (!isTeacher && !activeQuiz) return null;
  // If teacher and dialog closed and no quiz, don't show
  if (isTeacher && !isOpen && !activeQuiz && !pendingQuiz) return null;

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': appUserId,
        },
        body: JSON.stringify({ sessionId, topic }),
      });
      const data = await res.json();
      if (data.success && data.data?.quiz) {
        setPendingQuiz(data.data.quiz);
        window.dispatchEvent(new CustomEvent('aria-log', {
          detail: `[ARIA] Generated quiz draft for topic: "${topic}"`
        }));
      } else {
        alert('Failed to generate quiz: ' + (data.error?.message || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to generate quiz.');
    } finally {
      setGenerating(false);
    }
  };

  const handleApproveAndBroadcast = async () => {
    if (!pendingQuiz) return;
    const supabase = getSupabaseBrowser(appUserId);
    const channel = supabase.channel(`quiz-${sessionId}`);
    await channel.send({
      type: 'broadcast',
      event: 'new_quiz',
      payload: { quiz: pendingQuiz },
    });
    window.dispatchEvent(new CustomEvent('aria-log', {
      detail: `[ARIA] Teacher approved quiz on "${topic}". Broadcasting to room.`
    }));
  };

  const handleSelect = (qIndex: number, option: string) => {
    if (submitted || isTeacher) return;
    setAnswers(prev => ({ ...prev, [qIndex]: option }));
  };

  const calculateScore = () => {
    let score = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    activeQuiz?.questions.forEach((q: any, i: number) => {
      if (answers[i] === q.correctAnswer) score++;
    });
    return score;
  };

  const handleClose = () => {
    setActiveQuiz(null);
    if (onCloseCreator) onCloseCreator();
    setPendingQuiz(null);
  };

  // Render the quiz viewer (either for student to take, or teacher to monitor)
  if (activeQuiz) {
    return (
      <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="glass-heavy max-w-lg w-full rounded-2xl p-6 border border-aria-purple/30 shadow-2xl animate-in zoom-in-95 duration-300 relative flex flex-col max-h-full">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Dismiss Quiz"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-6 shrink-0">
            <div className="flex items-center justify-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-white tracking-tight">Pop Quiz!</h2>
              {isTeacher && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Teacher Monitor
                </span>
              )}
            </div>
            <p className="text-sm text-aria-purple-light">
              {isTeacher ? 'Live questions sent to students' : 'Answer the questions below'}
            </p>
          </div>

          <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1 min-h-[30vh]">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {activeQuiz.questions.map((q: any, i: number) => (
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

          <div className="mt-6 flex items-center justify-between shrink-0">
            {isTeacher ? (
              <div className="text-xs text-amber-300">
                Students are currently answering this quiz
              </div>
            ) : submitted ? (
              <div className="text-sm font-semibold">
                Score: <span className={calculateScore() === activeQuiz.questions.length ? 'text-emerald-400' : 'text-amber-400'}>{calculateScore()} / {activeQuiz.questions.length}</span>
              </div>
            ) : (
              <div className="text-xs text-slate-400">Answer all questions to submit</div>
            )}

            <div className="flex gap-3">
              {isTeacher ? (
                <button
                  onClick={handleClose}
                  className="px-5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 rounded-lg text-sm font-medium transition-colors"
                >
                  Close Quiz View
                </button>
              ) : submitted ? (
                <button onClick={handleClose} className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors">
                  Close
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSubmitted(true);
                    window.dispatchEvent(new CustomEvent('aria-log', {
                      detail: `[SYS] A student submitted quiz answers.`
                    }));
                  }}
                  disabled={Object.keys(answers).length < activeQuiz.questions.length}
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

  // Render the teacher's generation dialog
  if (isTeacher && isOpen) {
    return (
      <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="glass-heavy max-w-lg w-full rounded-2xl p-6 border border-aria-purple/30 shadow-2xl animate-in zoom-in-95 duration-300 relative flex flex-col max-h-full">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-xl font-bold text-white mb-4">Create Pop Quiz</h2>

          <div className="mb-4">
            <label className="block text-sm text-slate-300 mb-2">Quiz Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Photosynthesis, Newton's Laws..."
              className="w-full bg-surface-2 border border-surface-3 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-aria-purple transition-colors"
            />
          </div>

          {!pendingQuiz ? (
            <button
              onClick={handleGenerate}
              disabled={!topic.trim() || generating}
              className="w-full py-2.5 bg-aria-purple hover:bg-aria-purple-dark disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              {generating ? 'Generating with AI...' : 'Generate Quiz'}
            </button>
          ) : (
            <div className="mt-4 flex-1 overflow-y-auto min-h-[30vh]">
              <h3 className="font-semibold text-emerald-400 mb-3">Review Questions:</h3>
              <div className="space-y-4 pr-2 custom-scrollbar">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {pendingQuiz.questions.map((q: any, i: number) => (
                  <div key={i} className="bg-surface-2/50 p-3 rounded-lg border border-surface-3">
                    <p className="text-sm text-white font-medium mb-2">{i + 1}. {q.question}</p>
                    <div className="space-y-1">
                      {q.options.map((opt: string, j: number) => (
                        <div key={j} className={`text-xs p-1.5 rounded ${opt === q.correctAnswer ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400'}`}>
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setPendingQuiz(null)}
                  className="flex-1 py-2 bg-surface-2 hover:bg-surface-3 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  Discard & Retry
                </button>
                <button
                  onClick={handleApproveAndBroadcast}
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors text-sm shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                >
                  Approve & Display
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
