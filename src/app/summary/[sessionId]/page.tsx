'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SummaryView from '@/components/summary/SummaryView';

export default function SummaryPage({ params }: { params: { sessionId: string } }) {
  const router = useRouter();
  const [appUserId, setAppUserId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('aria_user_id');
    if (!id) {
      router.push('/');
      return;
    }
    setAppUserId(id);
  }, [router]);

  if (!appUserId) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-100">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <SummaryView sessionId={params.sessionId} appUserId={appUserId} />;
}
