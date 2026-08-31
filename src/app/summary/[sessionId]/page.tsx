'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SummaryView from '@/components/summary/SummaryView';

export default function SummaryPage({ params }: { params: { sessionId: string } }) {
  const router = useRouter();
  const [appUserId, setAppUserId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('aria_user_id');
    if (!id) { router.push('/'); return; }
    setAppUserId(id);
  }, [router]);

  if (!appUserId) return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center text-white">
      Loading...
    </div>
  );

  return <SummaryView sessionId={params.sessionId} appUserId={appUserId} />;
}
