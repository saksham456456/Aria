'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { IAgoraRTCClient } from 'agora-rtc-sdk-ng';

export type AriaMode = 'auto' | 'manual' | 'silent';
export type AriaState = 'listening' | 'thinking' | 'speaking' | 'paused' | 'error';

interface UseAriaOptions {
  sessionId: string;
  appUserId: string;
  role: 'teacher' | 'student';
  agoraClient: IAgoraRTCClient | null;
  isTeacherSpeaking: boolean;
}

export function useAria({
  sessionId,
  role,
  agoraClient,
}: UseAriaOptions) {
  const [ariaMode, setAriaMode] = useState<AriaMode>('auto');
  const [ariaPaused, setAriaPaused] = useState(false);
  const [ariaState, setAriaState] = useState<AriaState>('listening');
  const [lastCommand, setLastCommand] = useState<string | null>(null);

  const agentInvitedRef = useRef(false);

  const startAria = useCallback(() => {
    if (role === 'teacher' && agoraClient && agoraClient.uid && !agentInvitedRef.current) {
      agentInvitedRef.current = true;
      console.log('[ARIA] Inviting agent to channel:', sessionId, 'requester_id:', agoraClient.uid);
      
      const currentRemoteUids = agoraClient.remoteUsers.map(u => String(u.uid));
      
      fetch('/api/invite-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel_name: sessionId,
          requester_id: String(agoraClient.uid),
          additional_uids: currentRemoteUids,
        }),
      })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          console.error('[ARIA] Failed to invite agent:', data.error);
          agentInvitedRef.current = false; // allow retry
        } else {
          console.log('[ARIA] Agent started:', data);
        }
      })
      .catch(err => {
        console.error('[ARIA] Error calling invite-agent:', err);
        agentInvitedRef.current = false;
      });
    }
  }, [role, agoraClient, sessionId]);

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
    lastCommand,
    voiceError: null,
    client: agoraClient,
    startAria,
    pauseAria,
    resumeAria,
    setAriaMode,
    sendCommand,
  };
}
