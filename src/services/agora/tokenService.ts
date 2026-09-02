import { hashUid } from '@/lib/uid';

export const fetchAgoraToken = async (sessionId: string, appUserId: string): Promise<string> => {
  const numericUid = hashUid(appUserId);
  const res = await fetch('/api/agora/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': appUserId,
    },
    body: JSON.stringify({ channelName: sessionId, uid: numericUid, role: 'publisher' }),
  });

  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to fetch token');
  }
  return data.data.token;
};
