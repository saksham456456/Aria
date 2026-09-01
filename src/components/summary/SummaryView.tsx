/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SessionSummary } from '@/types/session';
import { supabaseBrowser } from '@/services/supabase/client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, ArrowLeft, BookOpen, BrainCircuit, Users, Target, Lightbulb } from 'lucide-react';

type ViewState = 'loading' | 'generating' | 'ready' | 'error' | 'no-access';

export default function SummaryView({ sessionId, appUserId }: { sessionId: string; appUserId: string }) {
  const router = useRouter();
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [summary, setSummary] = useState<SessionSummary | null>(null);

  const fetchSummary = useCallback(async () => {
    const { data: pData } = await supabaseBrowser
      .from('participants')
      .select('role')
      .eq('session_id', sessionId)
      .eq('app_user_id', appUserId)
      .single();

    if (!pData || pData.role !== 'teacher') {
      setViewState('no-access');
      return;
    }

    const { data: sData } = await supabaseBrowser
      .from('session_summaries')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (sData) {
      setSummary(sData as SessionSummary);
      setViewState('ready');
      return;
    }

    setViewState('generating');

    // Check session data and trigger generation
    const { data: sessData } = await supabaseBrowser.from('sessions').select('*, classrooms(*)').eq('id', sessionId).single();
    const { data: transcripts } = await supabaseBrowser.from('transcript_segments').select('*').eq('session_id', sessionId).order('created_at', { ascending: true });
    const { data: gaps } = await supabaseBrowser.from('learning_gaps').select('*').eq('session_id', sessionId);

    try {
      const res = await fetch('/api/session/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionData: sessData, transcripts, learningGaps: gaps })
      });
      const generated = await res.json();

      const { data: inserted, error } = await supabaseBrowser
        .from('session_summaries')
        .insert({
          session_id: sessionId,
          overview: generated.overview,
          topics_covered: generated.topics_covered,
          common_learning_gaps: generated.common_learning_gaps,
          student_insights: generated.student_insights,
          recommendations: generated.recommendations,
          aria_interventions_count: gaps?.length || 0
        })
        .select()
        .single();

      if (error) throw error;
      setSummary(inserted as SessionSummary);
      setViewState('ready');
    } catch (e) {
      console.error(e);
      setViewState('error');
    }
  }, [sessionId, appUserId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  if (viewState === 'no-access') {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-center space-y-4 text-zinc-100">
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="text-zinc-400">Only the teacher can view the post-class summary.</p>
        <Button onClick={() => router.push('/')} variant="outline" className="bg-transparent text-white border-zinc-700 hover:bg-zinc-800">Return Home</Button>
      </div>
    );
  }

  if (viewState === 'loading' || viewState === 'generating') {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-zinc-100 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
        <p className="text-zinc-400 animate-pulse">
          {viewState === 'generating' ? 'ARIA is analyzing the session transcript...' : 'Loading summary...'}
        </p>
      </div>
    );
  }

  if (viewState === 'error' || !summary) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-zinc-100 space-y-4">
        <h2 className="text-xl font-bold text-red-400">Failed to generate summary</h2>
        <Button onClick={() => router.push('/')} variant="outline" className="bg-transparent text-white border-zinc-700 hover:bg-zinc-800">Return Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Button variant="ghost" onClick={() => router.push('/')} className="mb-4 text-zinc-400 hover:text-white pl-0">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Post-Class Report</h1>
            <p className="text-zinc-400 mt-1">Generated by ARIA AI</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="bg-purple-900/50 text-purple-200 hover:bg-purple-900/50">
              {summary.aria_interventions_count} AI Interventions
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="insights">Student Insights</TabsTrigger>
            <TabsTrigger value="gaps">Learning Gaps</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="overview" className="space-y-6 mt-0">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="flex items-center text-zinc-100">
                    <BookOpen className="w-5 h-5 mr-2 text-blue-400" /> Executive Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-300 leading-relaxed">{summary.overview}</p>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="flex items-center text-zinc-100">
                      <Target className="w-5 h-5 mr-2 text-emerald-400" /> Topics Covered
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {summary.topics_covered?.map((topic, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                          <span className="text-zinc-300">{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="flex items-center text-zinc-100">
                      <Lightbulb className="w-5 h-5 mr-2 text-amber-400" /> Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-zinc-300 leading-relaxed">{summary.recommendations}</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="mt-0">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="flex items-center text-zinc-100">
                    <Users className="w-5 h-5 mr-2 text-purple-400" /> Individual Student Insights
                  </CardTitle>
                  <CardDescription className="text-zinc-400">Personalized feedback based on participation</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-6">
                      {Object.entries(summary.student_insights || {}).map(([student, insight]: [string, any], i) => (
                        <div key={i} className="space-y-2">
                          <h4 className="font-semibold text-zinc-200 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs">
                              {student.substring(0, 2).toUpperCase()}
                            </span>
                            {student}
                          </h4>
                          <p className="text-zinc-400 text-sm pl-10">{insight.progress || insight}</p>
                          {i < Object.keys(summary.student_insights || {}).length - 1 && (
                            <Separator className="bg-zinc-800 my-4 ml-10" />
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gaps" className="mt-0">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="flex items-center text-zinc-100">
                    <BrainCircuit className="w-5 h-5 mr-2 text-red-400" /> Identified Learning Gaps
                  </CardTitle>
                  <CardDescription className="text-zinc-400">Concepts that required further explanation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(summary.common_learning_gaps as any[])?.map((gap: any, i: number) => (
                      <div key={i} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-zinc-200">{gap.concept}</h4>
                          <Badge variant="outline" className="text-red-400 border-red-900 bg-red-950/30">Needs Review</Badge>
                        </div>
                        <p className="text-sm text-zinc-400">{gap.description}</p>
                      </div>
                    ))}
                    {(!summary.common_learning_gaps || (summary.common_learning_gaps as any[]).length === 0) && (
                      <p className="text-zinc-500 text-center py-8">No significant learning gaps were identified during this session.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
