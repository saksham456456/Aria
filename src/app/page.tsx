import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900">
      <div className="max-w-md text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">ARIA Co-Teacher</h1>
          <p className="text-xl text-gray-600">AI-powered live classroom for real learning</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/classroom/create"
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Classroom
          </Link>
          <Link
            href="/classroom/join"
            className="w-full sm:w-auto px-6 py-3 bg-white text-gray-900 border border-gray-300 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Join Classroom
          </Link>
        </div>
      </div>
    </main>
  );
}
