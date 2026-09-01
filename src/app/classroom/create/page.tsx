'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function CreateClassroomPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let appUserId = localStorage.getItem('aria_user_id');
    if (!appUserId) {
      appUserId = crypto.randomUUID();
      localStorage.setItem('aria_user_id', appUserId);
    }

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get('name'),
      subject: formData.get('subject'),
      topic: formData.get('topic'),
      grade: formData.get('grade'),
      lessonDescription: formData.get('lessonDescription'),
      teacherName: formData.get('teacherName'),
    };

    try {
      const res = await fetch('/api/session/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': appUserId },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error.message);

      // Navigate to room
      router.push(`/room/${json.data.sessionId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-4">
        <Link href="/" className="inline-flex items-center text-zinc-400 hover:text-zinc-200 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">Create a New Classroom</CardTitle>
            <CardDescription className="text-zinc-400">
              Set up your lesson details. ARIA will use this context to help students.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 bg-red-900/30 border border-red-900/50 rounded-md text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="teacherName" className="text-zinc-300">Your Name</Label>
                  <Input id="teacherName" name="teacherName" required placeholder="Mr. Smith" className="bg-zinc-950 border-zinc-800 text-zinc-100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-zinc-300">Classroom Name</Label>
                  <Input id="name" name="name" required placeholder="Math 101" className="bg-zinc-950 border-zinc-800 text-zinc-100" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-zinc-300">Subject</Label>
                  <Input id="subject" name="subject" required placeholder="Mathematics" className="bg-zinc-950 border-zinc-800 text-zinc-100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grade" className="text-zinc-300">Grade Level</Label>
                  <Input id="grade" name="grade" required placeholder="10th Grade" className="bg-zinc-950 border-zinc-800 text-zinc-100" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic" className="text-zinc-300">Current Topic</Label>
                <Input id="topic" name="topic" required placeholder="Quadratic Equations" className="bg-zinc-950 border-zinc-800 text-zinc-100" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lessonDescription" className="text-zinc-300">Lesson Description</Label>
                <Input id="lessonDescription" name="lessonDescription" required placeholder="Briefly describe what you'll cover today..." className="bg-zinc-950 border-zinc-800 text-zinc-100" />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {loading ? 'Creating...' : 'Start Classroom'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  );
}
