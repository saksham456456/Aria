import SummaryView from '@/components/summary/SummaryView';

export default function SummaryPage({ params }: { params: { sessionId: string } }) {
  return <div className="min-h-screen bg-gray-100 p-4">
     <SummaryView sessionId={params.sessionId} />
  </div>;
}
