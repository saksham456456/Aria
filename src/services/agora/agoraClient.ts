import AgoraRTC, { IAgoraRTCClient } from 'agora-rtc-sdk-ng';

let agoraClientInstance: IAgoraRTCClient | null = null;

export const getAgoraClient = (): IAgoraRTCClient => {
  if (typeof window === 'undefined') {
    throw new Error('AgoraRTC cannot be initialized on the server');
  }

  if (!agoraClientInstance) {
    agoraClientInstance = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
  }
  return agoraClientInstance;
};

export const resetAgoraClient = (): void => {
  agoraClientInstance = null;
};
