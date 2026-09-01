import { MeetingRoom } from '@/components/MeetingRoom';
import { supabaseServer } from '@/services/supabase/server';
import { redirect } from 'next/navigation';

export default async function RoomPage({ params }: { params: { sessionId: string } }) {
  const { data: session } = await supabaseServer
    .from('sessions')
    .select('*, classrooms(*)')
    .eq('id', params.sessionId)
    .single();

  if (!session) {
    redirect('/');
  }

  return (
    <MeetingRoom
      sessionId={params.sessionId}
      channelName={params.sessionId}
      userId="dummy-user" // we will need to load this on client side or pass differently
      userName="Participant"
      role="student"
      lessonContext={session.classrooms}
    />
  );
}
