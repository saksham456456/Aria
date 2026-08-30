'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { IAgoraRTCClient } from 'agora-rtc-sdk-ng';
import { useAriaVoice } from './useAriaVoice';
import { supabaseBrowser } from '@/services/supabase/client';

export type AriaMode = 'auto' | 'manual' | 'silent';

interface UseAriaOptions {
  sessionId: string;
  appUserId: string;
  role: 'teacher' | 'student';
  agoraClient: IAgoraRTCClient | null;
  isTeacherSpeaking: boolean;
}

export function useAria({
  sessionId,
  appUserId,
  role,
  agoraClient,
  isTeacherSpeaking,
}: UseAriaOptions) {
  const [ariaMode, setAriaMode] = useState<AriaMode>('auto');
  const [ariaPaused, setAriaPaused] = useState(false);
  const [ariaState, setAriaState] = useState<'listening' | 'thinking' | 'speaking' | 'paused' | 'error'>('listening');
  const [lastCommand, setLastCommand] = useState<string | null>(null);

  const { speak, voiceState, error: voiceError } = useAriaVoice(appUserId);
  const evaluationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastEvalRef = useRef<number>(0);
  const EVAL_INTERVAL_MS = 20000; // evaluate every 20 seconds
  const MIN_EVAL_INTERVAL_MS = 15000; // minimum 15s between evals

  // Sync speaking state to ariaState
  useEffect(() => {
    if (voiceState === 'speaking') setAriaState('speaking');
    else if (voiceState === 'fetching') setAriaState('thinking');
    else if (ariaPaused) setAriaState('paused');
    else setAriaState('listening');
  }, [voiceState, ariaPaused]);

  const evaluateAndSpeak = useCallback(async (teacherCommand?: string) => {
    if (!agoraClient) return;
    if (ariaPaused && !teacherCommand) return; // paused blocks auto, not commands
    if (voiceState === 'speaking' || voiceState === 'fetching') return;

    // Rate limit evaluations
    const now = Date.now();
    if (!teacherCommand && now - lastEvalRef.current < MIN_EVAL_INTERVAL_MS) return;
    lastEvalRef.current = now;

    if (!teacherCommand) setAriaState('thinking');

    try {
      const res = await fetch('/api/aria', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': appUserId,
        },
        body: JSON.stringify({
          sessionId,
          ariaMode: ariaPaused ? 'silent' : ariaMode,
          isTeacherSpeaking,
          teacherCommand: teacherCommand ?? undefined,
        }),
      });

      if (!res.ok) {
        setAriaState('listening');
        return;
      }

      const json = await res.json();
      if (!json.success) {
        setAriaState('listening');
        return;
      }

      const decision = json.data;

      if (decision.shouldSpeak && decision.response) {
        setAriaState('thinking');
        await speak(decision.response, agoraClient);

        // Post ARIA message to chat for text visibility
        await supabaseBrowser.from('messages').insert({
          session_id: sessionId,
          role: 'aria',
          sender_name: 'ARIA',
          text: decision.response,
        });
      } else {
        setAriaState('listening');
      }
    } catch (err) {
      console.error('[ARIA] evaluation error', err);
      setAriaState('listening');
    }
  }, [agoraClient, ariaPaused, voiceState, ariaMode, isTeacherSpeaking, sessionId, appUserId, speak]);

  // Handle explicit teacher commands
  const sendCommand = useCallback((command: string) => {
    setLastCommand(command);
    evaluateAndSpeak(command);
  }, [evaluateAndSpeak]);

  // Auto-evaluation loop — only run for teachers in auto mode
  useEffect(() => {
    if (role !== 'teacher') return;
    if (ariaMode === 'silent') return;

    evaluationIntervalRef.current = setInterval(() => {
      evaluateAndSpeak();
    }, EVAL_INTERVAL_MS);

    return () => {
      if (evaluationIntervalRef.current) {
        clearInterval(evaluationIntervalRef.current);
      }
    };
  }, [role, ariaMode, evaluateAndSpeak]);

  // Trigger evaluation on new transcript (via Supabase Realtime)
  useEffect(() => {
    if (role !== 'teacher') return;

    const channel = supabaseBrowser
      .channel(`aria_transcript_trigger:${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'transcript_segments',
          filter: `session_id=eq.${sessionId}` },
        () => {
          // New speech detected — evaluate soon if not already evaluating
          const now = Date.now();
          if (now - lastEvalRef.current > MIN_EVAL_INTERVAL_MS) {
            evaluateAndSpeak();
          }
        }
      )
      .subscribe();

    return () => { supabaseBrowser.removeChannel(channel); };
  }, [sessionId, role, evaluateAndSpeak]);

  const pauseAria = useCallback(() => {
    setAriaPaused(true);
    setAriaState('paused');
    if (evaluationIntervalRef.current) {
      clearInterval(evaluationIntervalRef.current);
    }
  }, []);

  const resumeAria = useCallback(() => {
    setAriaPaused(false);
    setAriaState('listening');
  }, []);

  return {
    ariaMode,
    setAriaMode,
    ariaState,
    ariaPaused,
    pauseAria,
    resumeAria,
    sendCommand,
    lastCommand,
    voiceError,
  };
}
