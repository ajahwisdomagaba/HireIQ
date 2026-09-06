'use client';

import React, { useState } from 'react';
import { 
  UserCheck, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  CreditCard, 
  FileText, 
  Video, 
  Zap,
  Lock,
  ChevronRight,
  ThumbsUp
} from 'lucide-react';
import { Candidate } from '@/types';

interface CandidatePortalViewProps {
  candidates: Candidate[];
}

export const CandidatePortalView: React.FC<CandidatePortalViewProps> = ({ candidates }) => {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate>(candidates[0]);
  const [isPremiumSubscribed, setIsPremiumSubscribed] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'feedback' | 'cv_doctor' | 'mock_interview'>('feedback');
  
  // CV Doctor State
  const [rawBullet, setRawBullet] = useState<string>('Handled data entry in Excel and wrote Python scripts for marketing.');
  const [optimizedBullet, setOptimizedBullet] = useState<string>('');
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);

  // Mock Interview Prep State
  const [mockAnswer, setMockAnswer] = useState<string>('');
  const [mockAiEvaluation, setMockAiEvaluation] = useState<string | null>(null);

  const handleOptimizeBullet = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setOptimizedBullet(
        '• Engineered automated data ingestion pipelines in Python (Pandas/PostgreSQL), reducing manual reconciliation latency by 75% and eliminating duplicate payment discrepancies for 40,000+ monthly transactions.'
      );
      setIsOptimizing(false);
    }, 900);
  };

  const handleEvaluateMockAnswer = () => {
    setMockAiEvaluation(
      'Strong explanation of webhook verification using HMAC-SHA512. To reach Senior Tier, remember to mention database transaction isolation levels (SERIALIZABLE) to prevent race conditions during concurrent NIBSS network timeouts.'
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 relative overflow-hidden shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                Candidate Empowerment Portal
              </span>
              <span className="text-xs text-slate-500">Zero Ghosting · Full Transparency</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 font-display">
              Candidate Feedback & AI Career Accelerator
            </h1>
            <p className="text-xs text-slate-600 max-w-2xl mt-1 leading-relaxed">
              Every applicant receives concrete developmental feedback on why they were or weren't selected, plus Nigerian tech mock interview practice and CV Doctor.
            </p>
          </div>

          {/* Premium Subscription Upgrade Card */}
          <div className="bg-slate-50 border border-indigo-200 p-4 rounded-xl shrink-0 flex flex-col items-center text-center space-y-2 max-w-xs shadow-2xs">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-700">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>HireIQ Pro Candidate Tier</span>
            </div>
            <div className="text-xs text-slate-500">
              Unlimited AI CV Doctor + Mock Interview Co-Pilot + Direct Recruiter Spotlight
            </div>
            <button
              onClick={() => setIsPremiumSubscribed(!isPremiumSubscribed)}
              className={`w-full text-xs font-semibold py-2 px-3 rounded-lg transition shadow-xs ${
                isPremiumSubscribed
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white font-bold'
              }`}
            >
              {isPremiumSubscribed ? '✓ Pro Active (₦5,000/mo)' : 'Upgrade for ₦5,000 / mo'}
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex space-x-2 mt-6 border-t border-slate-100 pt-3">
          {[
            { id: 'feedback', label: '1. Developmental Feedback & Scorecard' },
            { id: 'cv_doctor', label: '2. AI CV Doctor (Anti-Inflation Polish)' },
            { id: 'mock_interview', label: '3. Nigerian Tech Mock Interview Studio' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                activeTab === tab.id
                  ? 'bg-slate-100 text-slate-900 border border-slate-200 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Candidate Switcher Dropdown */}
      <div className="flex items-center space-x-3 bg-white border border-slate-200 p-3 rounded-xl shadow-xs">
        <span className="text-xs font-semibold text-slate-500">Viewing Candidate Profile:</span>
        <select
          value={selectedCandidate?.id}
          onChange={(e) => {
            const found = candidates.find((c) => c.id === e.target.value);
            if (found) setSelectedCandidate(found);
          }}
          className="bg-slate-50 text-slate-800 text-xs px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white"
        >
          {candidates.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} — {c.roleApplied} ({c.aiScore}% Match)
            </option>
          ))}
        </select>
      </div>

      {/* Tab 1: Developmental Feedback & Scorecard */}
      {activeTab === 'feedback' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (7 Cols): The Feedback Report */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Feedback Report for {selectedCandidate?.name}
                </h3>
                <p className="text-xs text-slate-500">Application: {selectedCandidate?.roleApplied}</p>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-slate-50 text-indigo-700 border border-slate-200">
                Score: {selectedCandidate?.aiScore}%
              </span>
            </div>

            {/* AI Summary Reasoning */}
            <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-2">
              <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Developmental Guidance (Why you were ranked here)</span>
              </h4>
              <p className="text-xs text-indigo-950 leading-relaxed">
                "{selectedCandidate?.report?.developmentalFeedback || 'Strong fundamentals in backend architectures. To qualify for top-tier fintech compensation bands, focus on writing unit tests for distributed locking and proving hands-on knowledge with Paystack/NIBSS settlement ledgers.'}"
              </p>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-200 space-y-2">
                <span className="text-xs font-bold text-emerald-800 flex items-center space-x-1 uppercase">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Where You Shined</span>
                </span>
                <ul className="text-xs text-slate-700 space-y-1.5">
                  {selectedCandidate?.report?.strengths?.map((s, i) => (
                    <li key={i} className="flex items-start space-x-1.5">
                      <span className="text-emerald-600 mt-0.5">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-200 space-y-2">
                <span className="text-xs font-bold text-amber-800 flex items-center space-x-1 uppercase">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Skills To Master Next</span>
                </span>
                <ul className="text-xs text-slate-700 space-y-1.5">
                  {selectedCandidate?.report?.weaknesses?.map((w, i) => (
                    <li key={i} className="flex items-start space-x-1.5">
                      <span className="text-amber-600 mt-0.5">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column (5 Cols): Recommended Next Steps & Learning Paths */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Personalized Nigerian Tech Learning Roadmap</span>
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">1. Master Idempotent Payment Webhooks</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-bold uppercase">Priority High</span>
                </div>
                <p className="text-[11px] text-slate-500">Learn HMAC SHA512 signature hashing and Redis SETNX concurrency locks.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">2. Low Bandwidth Frontend Architecture</span>
                  <span className="text-[10px] text-teal-700 bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded font-bold uppercase">Recommended</span>
                </div>
                <p className="text-[11px] text-slate-500">Techniques to optimize React/Next.js bundle sizes under 400KB for Nigerian 3G users.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">3. CBN Regulatory Compliance 101</span>
                  <span className="text-[10px] text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded font-bold uppercase">Foundational</span>
                </div>
                <p className="text-[11px] text-slate-500">Overview of KYC Tier 1-3, BVN/NIN verification flows, and NIBSS instant settlement rules.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: AI CV Doctor (Anti-Inflation Polish) */}
      {activeTab === 'cv_doctor' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-xs">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">AI CV Doctor: De-Fluff & Quantify Your Experience</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Transforms generic or inflated bullet points into high-impact, verified statements that Nigerian and global hiring managers respect.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] uppercase font-bold text-slate-500 block">Original CV Bullet Point</label>
              <textarea
                rows={4}
                value={rawBullet}
                onChange={(e) => setRawBullet(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white resize-none font-mono placeholder:text-slate-400"
              />
              <button
                onClick={handleOptimizeBullet}
                disabled={isOptimizing}
                className="flex items-center space-x-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isOptimizing ? 'Rewriting with Impact Metrics...' : 'Polish Bullet Point with AI'}</span>
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] uppercase font-bold text-indigo-700 block">AI Verified & Quantified Output</label>
              <div className="p-4 rounded-xl bg-slate-50 border border-indigo-200 min-h-[105px] text-xs text-slate-900 font-mono leading-relaxed">
                {optimizedBullet || (
                  <span className="text-slate-400 italic">Click "Polish Bullet Point with AI" to generate quantified impact...</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Mock Interview Studio */}
      {activeTab === 'mock_interview' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-xs">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">Nigerian Tech Mock Interview Studio</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Practice role-specific interview questions commonly asked by top Nigerian companies like Paystack, Flutterwave, Moniepoint, and Kuda.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200 space-y-2">
            <span className="text-[10px] uppercase font-bold text-rose-700">Mock Question (Fintech Systems)</span>
            <p className="text-sm font-semibold text-slate-900">
              "How would you ensure that a user is never double-debited when Paystack sends 3 duplicate webhook retries simultaneously?"
            </p>
          </div>

          <div className="space-y-2">
            <textarea
              rows={4}
              value={mockAnswer}
              onChange={(e) => setMockAnswer(e.target.value)}
              placeholder="Type your architectural answer here (explain hash validation, redis locks, db transactions)..."
              className="w-full bg-slate-50 text-slate-800 text-xs p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white placeholder:text-slate-400"
            />

            <div className="flex justify-end">
              <button
                onClick={handleEvaluateMockAnswer}
                disabled={!mockAnswer.trim()}
                className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition shadow-xs"
              >
                Evaluate My Answer
              </button>
            </div>
          </div>

          {mockAiEvaluation && (
            <div className="p-4 rounded-xl bg-slate-50 border border-indigo-200 text-xs text-slate-800 space-y-1">
              <span className="font-bold text-indigo-700">AI Scoring & Feedback:</span>
              <p>{mockAiEvaluation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};