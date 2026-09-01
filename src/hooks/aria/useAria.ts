'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { IAgoraRTCClient } from 'agora-rtc-sdk-ng';
import { useAriaVoice } from './useAriaVoice';
import { getSupabaseBrowser } from '@/services/supabase/client';

export type AriaMode = 'auto' | 'manual' | 'silent';
export type AriaState = 'listening' | 'thinking' | 'speaking' | 'paused' | 'error';

interface UseAriaOptions {
  sessionId: string;
  appUserId: string;
  role: 'teacher' | 'student';
  agoraClient: IAgoraRTCClient | null;
  isTeacherSpeaking: boolean;
}

const EVAL_COOLDOWN_MS = 15_000;   // minimum gap between auto-evaluations
const EVAL_INTERVAL_MS = 20_000;   // periodic auto-evaluation interval

export function useAria({
  sessionId,
  appUserId,
  role,
  agoraClient,
  isTeacherSpeaking,
}: UseAriaOptions) {
  const [ariaMode, setAriaMode] = useState<AriaMode>('auto');
  const [ariaPaused, setAriaPaused] = useState(false);
  const [ariaState, setAriaState] = useState<AriaState>('listening');
  const [lastCommand, setLastCommand] = useState<string | null>(null);

  const { speak, voiceState, error: voiceError } = useAriaVoice(appUserId);

  const evalIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastEvalRef     = useRef(0);
  const ariaModeRef     = useRef<AriaMode>('auto');
  const ariaPausedRef   = useRef(false);

  useEffect(() => { ariaModeRef.current   = ariaMode;   }, [ariaMode]);
  useEffect(() => { ariaPausedRef.current = ariaPaused; }, [ariaPaused]);

  // Sync voice state to ariaState
  useEffect(() => {
    if (voiceState === 'speaking') setAriaState('speaking');
    else if (voiceState === 'fetching') setAriaState('thinking');
    else if (ariaPausedRef.current) setAriaState('paused');
    else setAriaState('listening');
  }, [voiceState]);

  const evaluateAndSpeak = useCallback(async (teacherCommand?: string) => {
    if (!agoraClient) return;
    if (ariaPausedRef.current && !teacherCommand) return;
    if (voiceState === 'speaking' || voiceState === 'fetching') return;

    const now = Date.now();
    if (!teacherCommand && now - lastEvalRef.current < EVAL_COOLDOWN_MS) return;
    lastEvalRef.current = now;

    if (!teacherCommand) setAriaState('thinking');

    try {
      const supabase = getSupabaseBrowser(appUserId);
      const res = await fetch('/api/aria', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': appUserId,
        },
        body: JSON.stringify({
          sessionId,
          ariaMode: ariaPausedRef.current ? 'silent' : ariaModeRef.current,
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

        // Persist ARIA message to chat so all participants see it as text
        await supabase.from('messages').insert({
          session_id:   sessionId,
          role:         'aria',
          sender_name:  'ARIA',
          text:         decision.response,
        });
      } else {
        setAriaState('listening');
      }
    } catch (err) {
      console.error('[ARIA] evaluation error', err);
      setAriaState('listening');
    }
  }, [agoraClient, voiceState, isTeacherSpeaking, sessionId, appUserId, speak]);

  const sendCommand = useCallback((command: string) => {
    setLastCommand(command);
    evaluateAndSpeak(command);
  }, [evaluateAndSpeak]);

  // Periodic auto-evaluation — teacher only, auto mode
  useEffect(() => {
    if (role !== 'teacher') return;
    if (ariaMode === 'silent') return;

    evalIntervalRef.current = setInterval(() => {
      evaluateAndSpeak();
    }, EVAL_INTERVAL_MS);

    return () => {
      if (evalIntervalRef.current) clearInterval(evalIntervalRef.current);
    };
  }, [role, ariaMode, evaluateAndSpeak]);

  // Trigger evaluation when new transcript segments arrive — teacher only
  useEffect(() => {
    if (role !== 'teacher') return;

    const supabase = getSupabaseBrowser(appUserId);
    const channel = supabase
      .channel(`aria_transcript_trigger:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transcript_segments',
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          if (Date.now() - lastEvalRef.current > EVAL_COOLDOWN_MS) {
            evaluateAndSpeak();
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sessionId, appUserId, role, evaluateAndSpeak]);

  const pauseAria = useCallback(() => {
    setAriaPaused(true);
    setAriaState('paused');
    if (evalIntervalRef.current) clearInterval(evalIntervalRef.current);
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
