import { IRemoteAudioTrack, IRemoteVideoTrack } from 'agora-rtc-sdk-ng';

export interface AgoraUser {
  uid: string;
  audioTrack?: IRemoteAudioTrack;
  videoTrack?: IRemoteVideoTrack;
  hasAudio: boolean;
  hasVideo: boolean;
}

export type ConnectionState =
  | 'idle'
  | 'joining'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnecting'
  | 'disconnected'
  | 'ended'
  | 'error';
