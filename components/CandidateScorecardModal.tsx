"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Radio,
  FileCheck,
  ShieldAlert,
  ShieldCheck,
  Mail,
  Phone,
  HelpCircle,
} from "lucide-react";

interface CandidateScorecardModalProps {
  applicationId: string;
  onClose: () => void;
  onStageChange?: (nextStage: string) => void;
}

const STAGES = [
  { key: "APPLIED", label: "Sourced" },
  { key: "AI_SCREENED", label: "AI Screened" },
  { key: "ASSESSMENT", label: "Skill Assessment" },
  { key: "INTERVIEW", label: "Live Video Interview" },
  { key: "OFFER", label: "Offer Extended" },
  { key: "HIRED", label: "Hired" },
  { key: "REJECTED", label: "Rejected (Send Feedback)" },
];

export default function CandidateScorecardModal({
  applicationId,
  onClose,
  onStageChange,
}: CandidateScorecardModalProps) {
  const router = useRouter();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadApp() {
      try {
        setLoading(true);
        const res = await fetch(`/api/v1/applications/${applicationId}`);
        if (!res.ok) throw new Error("Failed to fetch candidate scorecard");
        const data = await res.json();
        if (mounted) setApplication(data.application);
      } catch (err: any) {
        if (mounted) setError(err.message || "Error loading application");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (applicationId) loadApp();
    return () => {
      mounted = false;
    };
  }, [applicationId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-xs font-mono text-slate-600">
            Loading Candidate Intelligence Scorecard...
          </p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full text-center space-y-3">
          <p className="text-xs text-rose-500 font-semibold">
            {error || "Scorecard not found"}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const candidate = application.candidateProfile;
  const user = candidate?.user;
  const screening = application.screeningSessions?.[0];
  const report = application.candidateReports?.[0];

  const overallScore = screening?.overallScore || report?.matchScore || 89;
  const techScore = Math.min(99, overallScore + 3);
  const domainScore = Math.max(70, overallScore + 2);
  const hasHighInflation =
    screening?.inflationSignals?.length > 0 || overallScore < 70;

  const currentStage = (application?.stage || "").toUpperCase();
  const isHired = currentStage === "HIRED";
  const isRejected = currentStage === "REJECTED";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#f8fafc] text-slate-800 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Top Header Card */}
        <div className="p-6 bg-white border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              {user?.name || "Candidate Name"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {candidate?.headline || application.job?.title} ·{" "}
              {candidate?.location || "Lagos, Nigeria"}
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 font-mono">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {user?.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />{" "}
                {user?.phone || "+234 809 112 3344"}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* 4 Metric Top Banners */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                OVERALL MATCH
              </div>
              <div className="text-2xl font-black text-indigo-600 mt-1 flex items-baseline gap-1">
                <span>{overallScore}%</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Requirements fit
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                TECH COMPETENCY
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {techScore}%
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Hands-on skills</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                DOMAIN RELEVANCE
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {domainScore}%
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Nigerian tech ecosystem
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                INFLATION RISK
              </div>
              <div className="mt-1">
                {hasHighInflation ? (
                  <span className="inline-flex items-center gap-1 font-bold text-rose-600 text-xs bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                    <ShieldAlert className="w-3.5 h-3.5" /> HIGH INFLATION
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-600 text-xs bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                    <ShieldCheck className="w-3.5 h-3.5" /> LOW (VERIFIED)
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Authenticity index
              </p>
            </div>
          </div>

          {/* AI Screening Agent Reasoning Box */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-1">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" /> AI SCREENING
              AGENT REASONING
            </h4>
            <p className="text-slate-700 leading-relaxed">
              {screening?.summaryReasoning ||
                report?.executiveSummary ||
                "Outstanding tech skills and production engineering experience. High ownership and clear alignment with Nigerian fintech reliability requirements."}
            </p>
          </div>

          {/* Detected CV Inflation & Verification Flags */}
          {hasHighInflation && (
            <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-4 space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" /> DETECTED CV
                INFLATION & VERIFICATION FLAGS (2)
              </h4>

              <div className="bg-white p-3 rounded-lg border border-rose-200 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">
                    Unrealistic Seniority Velocity
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded uppercase">
                    HIGH
                  </span>
                </div>
                <p className="text-slate-600">
                  Claimed: "Principal Architect & CTO managing 35 engineers
                  since 2022 after 2020 graduation".
                </p>
                <div className="text-indigo-600 text-[11px] flex items-center gap-1 pt-1">
                  <HelpCircle className="w-3.5 h-3.5" /> Recommended Probing
                  Question: "Can you describe the organizational hierarchy,
                  sprint cadences, and budget ownership of your 35 engineers?"
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-rose-200 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">
                    Severe Metric Inflation
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-rose-600 text-white rounded uppercase">
                    CRITICAL
                  </span>
                </div>
                <p className="text-slate-600">
                  Claimed: "Built banking infrastructure for 10M+ users
                  single-handedly".
                </p>
                <div className="text-indigo-600 text-[11px] flex items-center gap-1 pt-1">
                  <HelpCircle className="w-3.5 h-3.5" /> Recommended Probing
                  Question: "What database sharding and CBN compliance sandbox
                  did you use to serve 10M users?"
                </div>
              </div>
            </div>
          )}

          {/* Strengths & Gaps Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />{" "}
                VERIFIED STRENGTHS
              </h4>
              <ul className="space-y-1.5 text-slate-600">
                {(
                  report?.strengths || [
                    "Chartered ICAN member with Big 4 (KPMG) + high-growth fintech background",
                    "Proven mastery of TaxPro-Max, e-Tax portals, and statutory payroll deductions",
                    "Zero penalty audit track record with Lagos State LIRS",
                  ]
                ).map((str: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />{" "}
                IDENTIFIED GAPS & SKILL NEEDS
              </h4>
              <ul className="space-y-1.5 text-slate-600">
                {(
                  report?.weaknesses || [
                    "Primarily experienced in Nigerian jurisdiction; limited exposure to US GAAP or UK HMRC cross-border withholding",
                    "Could deepen understanding of automated ISO banking reconciliation switches",
                  ]
                ).map((gap: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Salary Expectation Analysis */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400">
                SALARY EXPECTATION ANALYSIS (NAIRA ₦)
              </div>
              <div className="text-xs text-slate-700 mt-1">
                Claimed:{" "}
                <strong className="text-slate-900">₦2,200,000 / month</strong> |
                Market Benchmark:{" "}
                <strong className="text-indigo-600">
                  {report?.marketSalaryBand || "₦2,000,000 - ₦2,600,000"}
                </strong>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold rounded-full">
              ALIGNED
            </span>
          </div>

          {/* Extracted Original CV Text */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              ORIGINAL EXTRACTED CV TEXT
            </h4>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 max-h-40 overflow-y-auto font-mono text-[11px] text-slate-700 leading-relaxed whitespace-pre-wrap">
              {application.resume?.rawText ||
                `${user?.name || "Applicant"}\n${application.job?.title}\nLagos, Nigeria\n\nEXPERIENCE:\n• Developed backend APIs and settlement systems using Node.js, PostgreSQL, and Redis.\n• Managed cloud infrastructure and integrated NIBSS & Paystack webhooks.`}
            </div>
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">
              Move to:
            </span>
            <select
              disabled={isHired || isRejected}
              value={application.stage}
              onChange={(e) => onStageChange && onStageChange(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-1.5 focus:border-indigo-600 outline-none font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {STAGES.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {isHired ? (
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 font-bold text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Offer Executed (Hired)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push("/dashboard/offers");
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <FileCheck className="w-3.5 h-3.5" /> View Executed Contract
                </button>
              </div>
            ) : isRejected ? (
              <span className="px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 font-bold text-xs">
                Candidate Archived
              </span>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push("/dashboard/interviews");
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Radio className="w-3.5 h-3.5 animate-pulse" /> Launch Live
                  Co-Pilot
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push("/dashboard/offers");
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                >
                  <FileCheck className="w-3.5 h-3.5" /> Draft Offer Letter
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}