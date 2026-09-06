'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Code2, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Sparkles, 
  Loader2,
  Terminal,
  Clock,
  CheckCircle
} from 'lucide-react';

export default function RecruiterAssessmentReviewPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAssessment() {
      try {
        const res = await fetch(`/api/v1/assessments/${params.assessmentId}`);
        if (res.ok) {
          const json = await res.json();
          setData(json.assessment);
        }
      } catch (err) {
        console.error('Failed to load assessment review', err);
      } finally {
        setLoading(false);
      }
    }
    loadAssessment();
  }, [params.assessmentId]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin mr-2 text-emerald-400" />
        Loading assessment review...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 text-slate-200">
      {/* Header */}
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <Code2 className="h-5 w-5 text-emerald-400" />
              {data?.title || 'Technical Assessment Review'}
            </h1>
            <p className="text-xs text-slate-400">
              Role: {data?.job?.title} • Language: {data?.language || 'TypeScript'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-lg font-semibold">
            Assessment Active
          </span>
        </div>
      </div>

      {/* Main Review Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left: Challenge Specification */}
        <div className="col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Problem Statement
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800/80 whitespace-pre-wrap">
              {data?.problemStatement}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Candidate Portal Direct Link
            </h3>
            <p className="text-xs text-slate-400">Share this test link directly with applicants:</p>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 break-all select-all">
              {typeof window !== 'undefined' ? `${window.location.origin}/app/assessments/${params.assessmentId}` : ''}
            </div>
          </div>
        </div>

        {/* Right: Starter Code & Test Suite */}
        <div className="col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Terminal className="h-4 w-4 text-emerald-400" /> Starter Code Template
            </span>
          </div>
          <div className="flex-1 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto whitespace-pre">
            {data?.starterCode}
          </div>
        </div>
      </div>
    </div>
  );
}