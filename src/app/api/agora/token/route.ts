import { NextRequest, NextResponse } from 'next/server';
import { RtcTokenBuilder, RtcRole } from 'agora-token';
import { hashUid } from '@/lib/uid';

export async function POST(req: NextRequest) {
  try {
    const { channelName, uid, role = 'publisher' } = await req.json();
    const numericUid = typeof uid === 'number' ? uid : hashUid(String(uid || '0'));

    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    if (!appId || !appCertificate) {
      return NextResponse.json({ success: false, error: { code: 'missing_credentials', message: 'Agora credentials missing' } }, { status: 500 });
    }

    const rtcRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
    const expirationTimeInSeconds = 3600 * 24; // 24 hours
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      numericUid,
      rtcRole,
      privilegeExpiredTs,
      privilegeExpiredTs
    );

    return NextResponse.json({ success: true, data: { token, uid: numericUid, channelName } });
  } catch {
    return NextResponse.json({ success: false, error: { code: 'token_error', message: 'Failed to generate Agora token' } }, { status: 500 });
  }
}
