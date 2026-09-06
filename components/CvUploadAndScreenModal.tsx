'use client';

import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  ArrowRight,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Candidate, Job } from '@/types';

interface CvUploadAndScreenModalProps {
  jobs: Job[];
  onClose: () => void;
  onAddCandidate: (candidate: Candidate) => void;
}

const PRESET_CVS = [
  {
    title: 'Authentic Senior Fintech Backend (UNILAG)',
    name: 'Olumide Bakare',
    role: 'Senior Backend Engineer (Node.js/Fintech)',
    text: `OLUMIDE BAKARE
Lagos (Yaba), Nigeria | olumide.bakare@gmail.com | +234 803 991 2234

SUMMARY
Backend Engineer with 4.5 years experience in Nigerian payment switching, transaction ledgers, and distributed systems at Interswitch and Flutterwave.

EXPERIENCE
Software Engineer — Interswitch Group (2022 - Present)
- Integrated ISO 8583 payment card switches handling 600,000+ daily POS and ATM transactions.
- Built automated settlement batching pipelines in Node.js and PostgreSQL.
- Handled NIBSS NIP instant payout settlement webhooks with Redis idempotency locks.

Backend Developer — Cowrywise (2020 - 2022)
- Maintained automated mutual fund investment ledger and direct debit billing engines.

EDUCATION
University of Lagos (UNILAG) — B.Sc Systems Engineering (First Class Honours, 2020)`,
  },
  {
    title: 'High Inflation Risk ("CTO & 20M users" in 1.5 yrs)',
    name: 'Kingsley Nnamdi',
    role: 'Senior Backend Engineer (Node.js/Fintech)',
    text: `KINGSLEY NNAMDI
Chief Technology Officer & AI Visionary
Email: kingsley.nnamdi.super@gmail.com

SUMMARY
World renowned tech titan with 8+ years experience mastering Node.js, AI, Blockchain, Next.js, and Quantum Computing.

EXPERIENCE
Chief Technology Officer & Group VP — Apex Global Systems (2023 - Present)
- Managed 50 engineers globally across Lagos, New York, and Dubai.
- Single handedly coded core banking switch processing ₦50 Billion weekly with zero bugs.
- Pioneered proprietary machine learning fraud prevention.

Lead Architect — Freelance Tech Hub (2022 - 2023)
- Built 60 full-stack banking applications.

EDUCATION
University of Port Harcourt — B.Sc Computer Science (Graduated December 2022)`,
  },
  {
    title: 'Excel / Data Entry Inflation ("Advanced Excel")',
    name: 'Blessing Adeyemi',
    role: 'Financial Controller & Tax Lead',
    text: `BLESSING ADEYEMI
Financial Analyst & Advanced Excel Guru
Lagos, Nigeria | blessing.adeyemi@yahoo.com

EXPERIENCE
Finance Assistant — Lagos Mainland Trading Enterprise (2023 - Present)
- Typed sales receipts into Excel spreadsheets daily.
- Highlighted late customer payment rows in yellow.
- Expertise in Advanced Excel, Python Machine Learning, NetSuite ERP, and Big 4 Auditing.

EDUCATION
Lagos State University (LASU) — B.Sc Business Administration (2023)`,
  }
];

export const CvUploadAndScreenModal: React.FC<CvUploadAndScreenModalProps> = ({
  jobs,
  onClose,
  onAddCandidate,
}) => {
  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.id || 'job-1');
  const [candidateName, setCandidateName] = useState<string>('Olumide Bakare');
  const [candidateEmail, setCandidateEmail] = useState<string>('olumide.bakare@gmail.com');
  const [cvText, setCvText] = useState<string>(PRESET_CVS[0].text);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [screenedResult, setScreenedResult] = useState<any>(null);

  const targetJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  const handleSelectPreset = (preset: typeof PRESET_CVS[0]) => {
    setCandidateName(preset.name);
    setCandidateEmail(`${preset.name.toLowerCase().replace(' ', '.')}@gmail.com`);
    setCvText(preset.text);
    const matchingJob = jobs.find((j) => j.title.includes('Backend') || j.title === preset.role);
    if (matchingJob) {
      setSelectedJobId(matchingJob.id);
    }
  };

  const handleRunAiScreening = async () => {
    if (!cvText.trim()) return;
    setIsProcessing(true);
    setStepIndex(1); // Document Parse

    try {
      setTimeout(() => setStepIndex(2), 700); // Embedding
      setTimeout(() => setStepIndex(3), 1400); // AI Screening
      setTimeout(() => setStepIndex(4), 2100); // Inflation Check

      const response = await fetch('/api/ai/screen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvText,
          jobTitle: targetJob?.title,
          jobDescription: targetJob?.description,
          requirements: targetJob?.requirements,
        }),
      });

      const data = await response.json();
      setScreenedResult(data);
      setIsProcessing(false);
      setStepIndex(5); // Finished
    } catch (err) {
      console.error('Screening error:', err);
      setIsProcessing(false);
    }
  };

  const handleCommitCandidate = () => {
    if (!screenedResult) return;

    const newCandidate: Candidate = {
      id: `cand-${Date.now()}`,
      name: candidateName || 'Screened Candidate',
      email: candidateEmail || 'candidate@hireiq.ng',
      phone: '+234 803 ' + Math.floor(1000000 + Math.random() * 9000000),
      location: 'Lagos (Yaba)',
      avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=150&auto=format&fit=crop&q=80`,
      roleApplied: targetJob?.title || 'Software Engineer',
      jobId: selectedJobId,
      appliedDate: new Date().toISOString().split('T')[0],
      stage: 'screened',
      aiScore: screenedResult.overallScore || 75,
      inflationRisk: screenedResult.inflationRisk || 'low',
      yearsOfExperience: 4,
      skills: screenedResult.strengths?.slice(0, 4) || ['Node.js', 'PostgreSQL'],
      education: "University Graduate (Nigeria)",
      rawCvText: cvText,
      report: screenedResult,
    };

    onAddCandidate(newCandidate);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">AI Resume Screening & Inflation Check</h2>
              <p className="text-xs text-slate-500">Calibrated against Nigerian tech requirements & local inflation heuristics</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Quick Presets */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>Quick Test Presets (Authentic vs Inflated Nigerian CVs):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PRESET_CVS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(p)}
                  className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-left hover:border-indigo-300 hover:bg-white transition text-xs space-y-1 shadow-2xs"
                >
                  <div className="font-semibold text-slate-900 truncate">{p.name}</div>
                  <div className="text-[10px] text-slate-500 line-clamp-1">{p.title}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Role selector & Candidate Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] uppercase font-bold text-slate-500 block mb-1">Target Opening</label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white"
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] uppercase font-bold text-slate-500 block mb-1">Candidate Name</label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase font-bold text-slate-500 block mb-1">Email Address</label>
              <input
                type="email"
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          {/* CV Text Area */}
          <div className="space-y-1">
            <label className="text-[11px] uppercase font-bold text-slate-500 block">Candidate CV Text / Profile</label>
            <textarea
              rows={7}
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              placeholder="Paste candidate CV text or upload document..."
              className="w-full bg-slate-50 text-slate-800 text-xs font-mono p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 resize-none leading-relaxed"
            />
          </div>

          {/* Pipeline Progress Indicator */}
          {isProcessing && (
            <div className="p-4 rounded-xl bg-slate-50 border border-indigo-200 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-700">
                <span className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Running AI Screening Agents...</span>
                </span>
                <span className="font-mono">Stage {stepIndex}/4</span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-[10px] text-center">
                <div className={`p-1.5 rounded ${stepIndex >= 1 ? 'bg-indigo-50 text-indigo-900 border border-indigo-200 font-semibold' : 'bg-slate-100 text-slate-400'}`}>
                  1. LLM Parsing
                </div>
                <div className={`p-1.5 rounded ${stepIndex >= 2 ? 'bg-indigo-50 text-indigo-900 border border-indigo-200 font-semibold' : 'bg-slate-100 text-slate-400'}`}>
                  2. Vector Embeddings
                </div>
                <div className={`p-1.5 rounded ${stepIndex >= 3 ? 'bg-indigo-50 text-indigo-900 border border-indigo-200 font-semibold' : 'bg-slate-100 text-slate-400'}`}>
                  3. Requirements Match
                </div>
                <div className={`p-1.5 rounded ${stepIndex >= 4 ? 'bg-indigo-50 text-indigo-900 border border-indigo-200 font-semibold' : 'bg-slate-100 text-slate-400'}`}>
                  4. Inflation Check
                </div>
              </div>
            </div>
          )}

          {/* Screened Result Preview */}
          {screenedResult && !isProcessing && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Screening Summary:</span>
                  <span className={`text-sm font-bold font-display ${
                    screenedResult.overallScore >= 80 ? 'text-indigo-600' : screenedResult.overallScore >= 65 ? 'text-teal-600' : 'text-amber-600'
                  }`}>
                    {screenedResult.overallScore}% Score
                  </span>
                </div>

                <div>
                  {screenedResult.inflationRisk === 'low' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold uppercase">
                      Low Risk (Verified)
                    </span>
                  )}
                  {screenedResult.inflationRisk === 'moderate' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold uppercase">
                      Moderate Risk
                    </span>
                  )}
                  {screenedResult.inflationRisk === 'high' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold uppercase">
                      High Inflation Risk
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                {screenedResult.summaryReasoning}
              </p>

              {screenedResult.inflationFlags?.length > 0 && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-800 space-y-1">
                  <span className="font-bold">Flagged: </span>
                  <span>{screenedResult.inflationFlags[0].claim} — {screenedResult.inflationFlags[0].explanation}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-4 py-2 transition"
          >
            Cancel
          </button>

          {!screenedResult ? (
            <button
              onClick={handleRunAiScreening}
              disabled={isProcessing || !cvText.trim()}
              className="flex items-center space-x-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl shadow-xs transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isProcessing ? 'Analyzing...' : 'Run AI Screening Agent'}</span>
            </button>
          ) : (
            <button
              onClick={handleCommitCandidate}
              className="flex items-center space-x-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-xs transition"
            >
              <span>Add Candidate to Pipeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};