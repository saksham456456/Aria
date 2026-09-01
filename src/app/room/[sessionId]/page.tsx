import MeetingRoom from '@/components/meeting/MeetingRoom';
import { supabaseServer } from '@/services/supabase/server';
import { redirect } from 'next/navigation';

export default async function RoomPage({ params }: { params: { sessionId: string } }) {
  const { data: session } = await supabaseServer
    .from('sessions')
    .select('*, classrooms(*)')
    .eq('id', params.sessionId)
    .single();

  if (!session || session.status === 'ended') {
    redirect('/');
  }

  return <MeetingRoom sessionId={params.sessionId} />;
}
