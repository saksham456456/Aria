import MeetingRoom from '@/components/meeting/MeetingRoom';

export default function RoomPage({ params }: { params: { sessionId: string } }) {
  return <MeetingRoom sessionId={params.sessionId} />;
}
