'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Code2, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Terminal, 
  Loader2, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';

export default function CandidateAssessmentPage() {
  const params = useParams();
  const router = useRouter();

  const [assessment, setAssessment] = useState<any>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [output, setOutput] = useState<any | null>(null);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes

  useEffect(() => {
    async function loadAssessment() {
      try {
        const res = await fetch(`/api/v1/assessments/${params.assessmentId}`);
        if (res.ok) {
          const data = await res.json();
          setAssessment(data.assessment);
          setCode(data.assessment.starterCode || '// Write your solution here\n\nexport async function solution() {\n  // Implement logic\n}');
        }
      } catch (err) {
        console.error('Failed to load assessment', err);
      } finally {
        setLoading(false);
      }
    }
    loadAssessment();
  }, [params.assessmentId]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setOutput(null);

    try {
      const res = await fetch(`/api/v1/assessments/${params.assessmentId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateCode: code,
          language: assessment?.language || 'typescript',
          timeTakenMinutes: Math.round((1800 - timeLeft) / 60),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setOutput(data.grading);
      } else {
        alert(data.error || 'Evaluation failed');
      }
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin mr-2 text-emerald-400" />
        Loading technical assessment challenge...
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-200">
      {/* Top Header */}
      <div className="h-14 border-b border-slate-800 bg-slate-900/90 px-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Code2 className="h-5 w-5 text-emerald-400" />
          <h1 className="text-sm font-bold text-white">
            {assessment?.title || 'Technical Assessment Challenge'}
          </h1>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full border border-slate-700 uppercase font-semibold">
            {assessment?.language || 'TypeScript'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-amber-400 font-mono">
            <Clock className="h-3.5 w-3.5" />
            {formatTime(timeLeft)}
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all"
          >
            {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 fill-current" />}
            {submitting ? 'Evaluating Code...' : 'Submit Solution'}
          </button>
        </div>
      </div>

      {/* Main Sandbox Grid */}
      <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
        {/* Left Column: Problem Statement & Test Cases */}
        <div className="col-span-5 border-r border-slate-800 p-6 overflow-y-auto space-y-6 bg-slate-950">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">
              Problem Description
            </h2>
            <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              {assessment?.problemStatement ||
                'Implement a thread-safe token bucket rate limiter middleware in TypeScript to handle burst spikes for financial webhook ingestion.'}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Evaluation Criteria
            </h3>
            <div className="space-y-2">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs space-y-1">
                <p className="font-semibold text-white">1. Algorithmic Correctness & State Safety</p>
                <p className="text-slate-400 text-[11px]">Handles concurrent calls and prevents race conditions under high throughput.</p>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs space-y-1">
                <p className="font-semibold text-white">2. Error Boundary & Fallbacks</p>
                <p className="text-slate-400 text-[11px]">Returns appropriate HTTP status headers (`Retry-After`, `429 Too Many Requests`).</p>
              </div>
            </div>
          </div>

          {/* AI Scorecard Result */}
          {output && (
            <div className="p-4 bg-slate-900 border border-emerald-500/40 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <Sparkles className="h-4 w-4" /> Assessment Scorecard
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  {output.overallScore}% ({output.passed ? 'PASSED' : 'RETRY'})
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{output.detailedFeedback}</p>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-400">
                <span>Complexity: <strong>{output.timeComplexity}</strong></span>
                <span>AI Likelihood: <strong className="text-emerald-400">{output.aiAssistanceLikelihood}</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: In-Browser Code Sandbox */}
        <div className="col-span-7 flex flex-col bg-slate-900/40">
          <div className="h-9 border-b border-slate-800 px-4 flex items-center justify-between text-xs text-slate-400 bg-slate-900/90">
            <span className="flex items-center gap-1.5 font-mono text-[11px]">
              <Terminal className="h-3.5 w-3.5 text-emerald-400" /> solution.ts
            </span>
            <span className="text-[10px] text-slate-500">Auto-saves locally</span>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="flex-1 w-full bg-slate-950 p-4 font-mono text-xs text-slate-100 outline-none resize-none leading-relaxed selection:bg-emerald-500/20"
          />
        </div>
      </div>
    </div>
  );
}