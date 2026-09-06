'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LiveInterviewStudio } from '@/components/LiveInterviewStudio';
import { Loader2, ArrowLeft, RefreshCw, Radio } from 'lucide-react';

export default function InterviewRoomPage() {
  const params = useParams();
  const router = useRouter();

  const rawId = params?.interviewId;
  const interviewId = Array.isArray(rawId) ? rawId[0] : (rawId as string);

  const [interview, setInterview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchSession() {
      if (!interviewId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMsg(null);

      try {
        const res = await fetch('/api/v1/interviews');
        if (!res.ok) {
          throw new Error(`Failed to load interviews (HTTP ${res.status})`);
        }

        const data = await res.json();
        const match = data.interviews?.find((i: any) => i.id === interviewId);

        if (!match) {
          throw new Error(`Interview session "${interviewId}" not found in current company workspace.`);
        }

        if (isMounted) {
          setInterview(match);
        }
      } catch (err: any) {
        console.error('Interview fetch error:', err);
        if (isMounted) {
          setErrorMsg(err.message || 'Unable to retrieve interview session.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchSession();

    return () => {
      isMounted = false;
    };
  }, [interviewId]);

  if (loading) {
    return (
      <div className="h-[75vh] flex flex-col items-center justify-center font-mono text-slate-400 space-y-3">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
        <p className="text-xs">Connecting to Interview Studio #{interviewId?.slice(-6) || '...'}</p>
      </div>
    );
  }

  if (errorMsg || !interview) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 bg-slate-900/60 border border-slate-800 rounded-2xl text-center space-y-4 font-mono text-xs text-slate-200">
        <p className="text-rose-400 font-semibold">{errorMsg || 'Interview session not found.'}</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
          <button
            onClick={() => router.push('/dashboard/interviews')}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 transition font-sans font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Interviews
          </button>
        </div>
      </div>
    );
  }

  const candidate = interview.application?.candidateProfile;
  const candidateData = {
    id: candidate?.id || 'cand-01',
    name: candidate?.user?.name || 'Applicant',
    email: candidate?.user?.email || 'applicant@hireiq.dev',
    roleApplied: interview.application?.job?.title || 'Technical Candidate',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    aiScore: 92,
    skills: ['TypeScript', 'Distributed Systems', 'Redis', 'PostgreSQL'],
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/dashboard/interviews')}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Active Sessions
        </button>

        <Link
          href={`/dashboard/interviews/${interviewId}/live`}
          className="text-xs px-3 py-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 rounded-lg flex items-center gap-1.5 font-medium transition"
        >
          <Radio className="w-3.5 h-3.5 animate-pulse" /> Launch Fullscreen HUD
        </Link>
      </div>

      <LiveInterviewStudio
        candidate={candidateData as any}
        candidates={[candidateData as any]}
        interviewId={interviewId}
        jobTitle={interview.application?.job?.title}
        onSelectCandidate={() => {}}
        onSaveInterviewReport={() => {
          router.push('/dashboard/interviews');
        }}
      />
    </div>
  );
}