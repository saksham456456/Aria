import AgoraRTC, { IAgoraRTCClient } from 'agora-rtc-sdk-ng';

let agoraClientInstance: IAgoraRTCClient | null = null;

/**
 * Returns the singleton Agora RTC client for the current session.
 * Must only be called in the browser — Agora is not SSR-compatible.
 */
export const getAgoraClient = (): IAgoraRTCClient => {
  if (typeof window === 'undefined') {
    throw new Error('AgoraRTC cannot be initialized on the server');
  }
  if (!agoraClientInstance) {
    agoraClientInstance = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
  }
  return agoraClientInstance;
};

/**
 * Destroys the singleton client reference.
 * Call this in the useEffect cleanup after client.leave() completes.
 * Required so that the next session gets a fresh, unregistered client.
 */
export const resetAgoraClient = (): void => {
  agoraClientInstance = null;
};
