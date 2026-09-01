import CreateClassroomForm from '@/components/classroom/CreateClassroomForm';

export default function CreateClassroomPage() {
  return (
    <main className="min-h-screen flex flex-col items-center py-12 bg-surface-0 text-white px-4">
      <div className="w-full max-w-md mb-8">
        <a href="/" className=" text-aria-purple-light hover:underline">&larr; Back to Home</a>
      </div>
      <CreateClassroomForm />
    </main>
  );
}
