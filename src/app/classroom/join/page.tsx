import JoinClassroomForm from '@/components/classroom/JoinClassroomForm';

export default function JoinClassroomPage() {
  return (
    <main className="min-h-screen flex flex-col items-center py-12 bg-gray-50 text-gray-900 px-4">
      <div className="w-full max-w-md mb-8">
        <a href="/" className=" text-blue-600 hover:underline">&larr; Back to Home</a>
      </div>
      <JoinClassroomForm />
    </main>
  );
}
