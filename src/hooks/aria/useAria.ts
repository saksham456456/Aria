'use client';

import { useState, useCallback, useRef } from 'react';
import { IAgoraRTCClient } from 'agora-rtc-sdk-ng';

export type AriaMode = 'auto' | 'manual' | 'silent';
export type AriaState = 'listening' | 'thinking' | 'speaking' | 'paused' | 'error';
export type AriaAgentStatus = 'idle' | 'joining' | 'running' | 'error';

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
}: UseAriaOptions) {
  const [ariaMode, setAriaMode] = useState<AriaMode>('auto');
  const [ariaPaused, setAriaPaused] = useState(false);
  const [ariaState, setAriaState] = useState<AriaState>('listening');
  const [status, setStatus] = useState<AriaAgentStatus>('idle');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [lastCommand, setLastCommand] = useState<string | null>(null);

  const agentInvitedRef = useRef(false);

  const startAria = useCallback(() => {
    if (role === 'teacher' && agoraClient && agoraClient.uid && !agentInvitedRef.current) {
      agentInvitedRef.current = true;
      setStatus('joining');
      setVoiceError(null);
      console.log('[ARIA] Inviting agent to channel:', sessionId, 'requester_id:', agoraClient.uid);
      
      fetch('/api/invite-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': appUserId,
        },
        body: JSON.stringify({
          channel_name: sessionId,
          requester_id: String(agoraClient.uid),
        }),
      })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          console.error('[ARIA] Failed to invite agent:', data.error);
          agentInvitedRef.current = false; // allow retry
          setStatus('error');
          setVoiceError(data.error);
        } else {
          console.log('[ARIA] Agent started:', data);
          setStatus('running');
        }
      })
      .catch(err => {
        console.error('[ARIA] Error calling invite-agent:', err);
        agentInvitedRef.current = false;
        setStatus('error');
        setVoiceError(err instanceof Error ? err.message : String(err));
      });
    }
  }, [role, agoraClient, sessionId, appUserId]);

  const pauseAria = useCallback(() => {
    setAriaPaused(true);
    setAriaState('paused');
  }, []);

  const resumeAria = useCallback(() => {
    setAriaPaused(false);
    setAriaState('listening');
  }, []);

  const sendCommand = useCallback((command: string) => {
    setLastCommand(command);
    console.log('[ARIA] sendCommand called but it is now handled by Agora Conversational AI directly', command);
  }, []);

  return {
    ariaMode,
    ariaPaused,
    ariaState,
    status,
    agentStatus: status,
    lastCommand,
    voiceError,
    client: agoraClient,
    startAria,
    pauseAria,
    resumeAria,
    setAriaMode,
    sendCommand,
  };
}
