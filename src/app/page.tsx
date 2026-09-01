'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Sparkles, Users, Presentation } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl w-full text-center space-y-8">

        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>The classroom&apos;s third voice</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-zinc-100">
            ARIA <span className="text-purple-400">Co-Teacher</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Real-time AI that listens, adapts, and intervenes in your live digital classroom.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 pt-8">
          <Card className="bg-zinc-900/50 border-zinc-800 text-left hover:border-zinc-700 transition-colors">
            <CardHeader>
              <Presentation className="w-8 h-8 text-purple-400 mb-2" />
              <CardTitle className="text-zinc-100">I am a Teacher</CardTitle>
              <CardDescription className="text-zinc-400">
                Start a new live classroom with ARIA as your co-teacher.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/classroom/create">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  Create Classroom
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800 text-left hover:border-zinc-700 transition-colors">
            <CardHeader>
              <Users className="w-8 h-8 text-blue-400 mb-2" />
              <CardTitle className="text-zinc-100">I am a Student</CardTitle>
              <CardDescription className="text-zinc-400">
                Join an existing classroom using a code provided by your teacher.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/classroom/join">
                <Button variant="outline" className="w-full border-zinc-700 hover:bg-zinc-800 text-zinc-200">
                  Join Classroom
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
