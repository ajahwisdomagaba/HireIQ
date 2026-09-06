'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Code2, 
  Clock, 
  ShieldAlert, 
  Play, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Terminal, 
  Lock, 
  Loader2,
  FileCode2,
  HelpCircle
} from 'lucide-react';

interface Question {
  id: string;
  title: string;
  category: string;
  difficulty: 'MEDIUM' | 'HARD';
  prompt: string;
  starterCode: string;
}

const SAMPLE_CHALLENGES: Question[] = [
  {
    id: 'q1',
    title: 'Nigerian Interbank Settlement Queue & Webhook Deduplication',
    category: 'Backend & High-Throughput Microservices',
    difficulty: 'HARD',
    prompt: `You are architecting a webhook processor receiving inbound debit transactions from NIBSS/Paystack. Under intermittent network outages, upstream gateways re-deliver the exact same transaction payload up to 5 times.
    
Write an idempotent handling function in TypeScript or Node.js that:
1. Validates the event signature with HMAC-SHA256.
2. Implements atomic idempotency via Redis distributed locking so concurrent duplicate webhooks return HTTP 200 without executing secondary ledger balances.
3. Handles failure scenarios gracefully.`,
    starterCode: `import crypto from 'crypto';

interface WebhookPayload {
  transactionRef: string;
  accountNumber: string;
  amountKobo: number;
  signature: string;
}

export async function processWebhookEvent(
  payload: WebhookPayload,
  redisClient: any
): Promise<{ status: string; code: number }> {
  // 1. Verify HMAC Signature
  
  // 2. Acquire Redis distributed lock for transactionRef
  
  // 3. Process ledger record & release lock
  
  return { status: 'SUCCESS', code: 200 };
}`
  },
  {
    id: 'q2',
    title: 'LIRS / PAYE Statutory Payroll Calculation Engine',
    category: 'Financial Engineering & Compliance',
    difficulty: 'MEDIUM',
    prompt: `Per the Nigerian Personal Income Tax Act (PITA) and Consolidated Relief Allowance (CRA):
1. Compute the CRA: Greater of ₦200,000 or 1% of Gross Income PLUS 20% of Gross Income.
2. Deduct 8% statutory Pension contribution.
3. Compute the graduated PAYE tax rate against the remaining taxable income:
   - First ₦300,000 @ 7%
   - Next ₦300,000 @ 11%
   - Next ₦500,000 @ 15%
   - Next ₦500,000 @ 19%
   - Next ₦1,600,000 @ 21%
   - Above ₦3,200,000 @ 24%

Return the exact monthly statutory deduction for a given gross monthly salary.`,
    starterCode: `export function calculateMonthlyPAYE(annualGrossNGN: number): {
  annualTax: number;
  monthlyTax: number;
  pensionDeduction: number;
  netMonthlyPay: number;
} {
  // TODO: Compute CRA, Pension (8%), and graduated tax brackets
  
  return {
    annualTax: 0,
    monthlyTax: 0,
    pensionDeduction: 0,
    netMonthlyPay: 0
  };
}`
  }
];

export default function CandidateAssessmentPage({ params }: { params: { id: string } }) {
  const applicationId = params.id;
  const router = useRouter();

  // State Management
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({
    q1: SAMPLE_CHALLENGES[0].starterCode,
    q2: SAMPLE_CHALLENGES[1].starterCode,
  });
  
  // Proctoring & Timer State
  const [secondsRemaining, setSecondsRemaining] = useState(45 * 60); // 45 minutes
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showProctorWarning, setShowProctorWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);

  // Focus and Tab Blur Tracking
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !submitted) {
        setTabSwitchCount((prev) => prev + 1);
        setShowProctorWarning(true);
      }
    };

    const handleWindowBlur = () => {
      if (!submitted) {
        setTabSwitchCount((prev) => prev + 1);
        setShowProctorWarning(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [submitted]);

  // Countdown timer
  useEffect(() => {
    if (submitted) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [submitted]);

  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCodeChange = (val: string) => {
    const qId = SAMPLE_CHALLENGES[activeQuestionIdx].id;
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/assessments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          codeAnswers: answers,
          tabSwitchCount,
          timeSpentSeconds: 45 * 60 - secondsRemaining,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
        setFinalScore(data.score);
      } else {
        alert(data.error || 'Failed to submit test');
      }
    } catch (e) {
      console.error(e);
      alert('Network error submitting assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQ = SAMPLE_CHALLENGES[activeQuestionIdx];

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg w-full text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Assessment Submitted!</h2>
            <p className="text-xs text-slate-400 mt-2">
              Your test has been delivered directly to the engineering team for automated test pass validation and code review.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Provisional Heuristic Score:</span>
            <span className="text-lg font-bold text-emerald-400">{finalScore ?? 85} / 100</span>
          </div>

          <p className="text-[11px] text-slate-500">
            If successful, you will receive an automated invitation to the Live Video Interview Studio.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100 font-sans overflow-hidden">
      
      {/* Top Banner Navigation & Proctoring Indicator */}
      <div className="h-16 px-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>HireIQ Engineering Assessment</span>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                Proctored Sandbox
              </span>
            </h1>
            <p className="text-[10px] text-slate-400">Application Reference: {applicationId}</p>
          </div>
        </div>

        {/* Proctoring Badges & Timer */}
        <div className="flex items-center gap-4">
          {tabSwitchCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-full text-xs font-mono">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{tabSwitchCount} Focus Warnings</span>
            </div>
          )}

          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono font-bold text-emerald-400 shadow-inner">
            <Clock className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 transition shadow-lg shadow-emerald-950 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Finish & Submit</span>
          </button>
        </div>
      </div>

      {/* Proctoring Banner Warning if Triggered */}
      {showProctorWarning && (
        <div className="bg-amber-950/80 border-b border-amber-800/80 px-6 py-2 flex items-center justify-between text-xs text-amber-200 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Proctor Notice:</strong> A window blur or tab switch was registered ({tabSwitchCount} total). All focus events are recorded in your ATS evaluation dossier.
            </span>
          </div>
          <button 
            onClick={() => setShowProctorWarning(false)}
            className="text-[11px] underline font-bold text-amber-300 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Workspace Split */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0">
        
        {/* Left 5 Cols: Problem Statement & Question Tabs */}
        <div className="lg:col-span-5 border-r border-slate-800 flex flex-col bg-slate-900/40 overflow-hidden">
          {/* Question Selector Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-900">
            {SAMPLE_CHALLENGES.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setActiveQuestionIdx(idx)}
                className={`px-5 py-3 text-xs font-bold border-r border-slate-800 transition flex items-center gap-2 ${
                  activeQuestionIdx === idx
                    ? 'bg-slate-950 text-emerald-400 border-t-2 border-t-emerald-500'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <span>Challenge #{idx + 1}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                  {q.difficulty}
                </span>
              </button>
            ))}
          </div>

          {/* Question Description */}
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                {currentQ.category}
              </span>
              <h2 className="text-base font-bold text-white leading-snug">
                {currentQ.title}
              </h2>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-line font-sans">
              {currentQ.prompt}
            </div>

            <div className="p-4 bg-indigo-950/20 rounded-2xl border border-indigo-900/30 space-y-2">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" /> Assessment Guidelines
              </h4>
              <ul className="text-[11px] text-slate-400 space-y-1 list-disc pl-4">
                <li>Handle edge cases such as network dropouts or duplicate requests.</li>
                <li>Clean, readable code with idiomatic structure is evaluated over brute force.</li>
                <li>All changes are autosaved into local state as you type.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right 7 Cols: Interactive Code Editor */}
        <div className="lg:col-span-7 flex flex-col bg-[#020617] overflow-hidden">
          {/* Editor Header Bar */}
          <div className="h-10 px-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <FileCode2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>solution.ts</span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span>TypeScript / Node.js</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
          </div>

          {/* Interactive Code Textarea Area */}
          <div className="flex-1 relative p-4 flex flex-col">
            <textarea
              value={answers[currentQ.id] || ''}
              onChange={(e) => handleCodeChange(e.target.value)}
              spellCheck={false}
              className="w-full flex-1 bg-transparent text-slate-200 font-mono text-xs leading-relaxed outline-none resize-none selection:bg-emerald-500/20"
              placeholder="// Write your solution here..."
            />
          </div>

          {/* Editor Bottom Console Bar */}
          <div className="h-10 px-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[11px]">Autosave active</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-500">
                Chars: {(answers[currentQ.id] || '').length}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
