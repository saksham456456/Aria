import dynamic from 'next/dynamic';

// MeetingRoom uses Agora SDK which requires browser APIs
const MeetingRoom = dynamic(
  () => import('@/components/meeting/MeetingRoom'),
  { ssr: false, loading: () => (
    <div className="h-screen bg-surface-0 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-aria-purple border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading classroom…</p>
      </div>
    </div>
  )}
);

export default function RoomPage({ params }: { params: { sessionId: string } }) {
  return <MeetingRoom sessionId={params.sessionId} />;
}
