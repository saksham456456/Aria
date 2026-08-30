export const fetchAgoraToken = async (sessionId: string, appUserId: string): Promise<string> => {
  const res = await fetch('/api/agora/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': appUserId,
    },
    body: JSON.stringify({ sessionId }),
  });

  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to fetch token');
  }
  return data.data.token;
};
