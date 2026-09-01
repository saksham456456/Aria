'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function JoinClassroomPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [learningLevel, setLearningLevel] = useState('intermediate');
  const [language, setLanguage] = useState('en');

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
    const joinCode = (formData.get('joinCode') as string || '').toUpperCase().trim();

    try {
      const res = await fetch('/api/session/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': appUserId },
        body: JSON.stringify({
          joinCode,
          name: formData.get('name'),
          learningLevel,
          language,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error.message);

      router.push(`/room/${json.data.sessionId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        <Link href="/" className="inline-flex items-center text-zinc-400 hover:text-zinc-200 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">Join Classroom</CardTitle>
            <CardDescription className="text-zinc-400">
              Enter the 6-character code provided by your teacher.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 bg-red-900/30 border border-red-900/50 rounded-md text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="joinCode" className="text-zinc-300">Classroom Code</Label>
                <Input
                  id="joinCode"
                  name="joinCode"
                  required
                  maxLength={6}
                  placeholder="e.g. M7K4P2"
                  className="bg-zinc-950 border-zinc-800 text-zinc-100 uppercase text-center tracking-widest font-mono text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-zinc-300">Your Name</Label>
                <Input id="name" name="name" required placeholder="Alex" className="bg-zinc-950 border-zinc-800 text-zinc-100" />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-300">Learning Level</Label>
                <Select value={learningLevel} onValueChange={setLearningLevel}>
                  <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-300">Preferred Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="en+hi">English + Hindi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {loading ? 'Joining...' : 'Join Class'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  );
}
