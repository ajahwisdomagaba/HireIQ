"use client";

import React from "react";
import {
  X,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Send,
  Video,
  Award,
  BookOpen,
} from "lucide-react";
import { Candidate, ApplicationStage } from "@/types";

interface CandidateDetailModalProps {
  candidate: Candidate | null;
  onClose: () => void;
  onUpdateStage: (candidateId: string, newStage: ApplicationStage) => void;
  onStartInterview: (candidate: Candidate) => void;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  candidate,
  onClose,
  onUpdateStage,
  onStartInterview,
}) => {
  if (!candidate) return null;

  const report = candidate.report;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/70">
          <div className="flex items-center space-x-4">
            <img
              src={candidate.avatar}
              alt={candidate.name}
              className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-2xs"
            />
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-bold text-slate-900 font-display">
                  {candidate.name}
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200 uppercase">
                  {candidate.stage}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {candidate.roleApplied}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{candidate.location}</span>
                </span>
                <span>·</span>
                <span className="flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{candidate.email}</span>
                </span>
                <span>·</span>
                <span className="flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{candidate.phone}</span>
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Top Intelligence Scoring Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="text-center sm:text-left sm:border-r sm:border-slate-200 sm:pr-3">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Overall Match
              </span>
              <div className="flex items-center space-x-1 mt-1 justify-center sm:justify-start">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <span className="text-2xl font-bold font-display text-indigo-600">
                  {candidate.aiScore}%
                </span>
              </div>
              <span className="text-[10px] text-slate-500">
                Requirements Fit
              </span>
            </div>

            <div className="text-center sm:text-left sm:border-r sm:border-slate-200 sm:pr-3">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Tech Competency
              </span>
              <div className="text-xl font-bold font-display text-slate-900 mt-1">
                {report?.technicalCompetency || 85}%
              </div>
              <span className="text-[10px] text-slate-500">
                Hands-on skills
              </span>
            </div>

            <div className="text-center sm:text-left sm:border-r sm:border-slate-200 sm:pr-3">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Domain Relevance
              </span>
              <div className="text-xl font-bold font-display text-slate-900 mt-1">
                {report?.domainRelevance || 90}%
              </div>
              <span className="text-[10px] text-slate-500">
                Nigerian tech ecosystem
              </span>
            </div>

            <div className="text-center sm:text-left">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Inflation Risk
              </span>
              <div className="mt-1">
                {candidate.inflationRisk === "low" && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold uppercase">
                    Low (Verified)
                  </span>
                )}
                {candidate.inflationRisk === "moderate" && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold uppercase">
                    Moderate Risk
                  </span>
                )}
                {candidate.inflationRisk === "high" && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold uppercase">
                    High Inflation
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Authenticity index
              </span>
            </div>
          </div>

          {/* AI Intelligence Summary Reasoning */}
          {report?.summaryReasoning && (
            <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>AI Screening Agent Reasoning</span>
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                {report.summaryReasoning}
              </p>
            </div>
          )}

          {/* CV Inflation Flags Section */}
          {report?.inflationFlags && report.inflationFlags.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center space-x-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>
                  Detected CV Inflation & Verification Flags (
                  {report.inflationFlags.length})
                </span>
              </h4>

              <div className="space-y-3">
                {report.inflationFlags.map((flag) => (
                  <div
                    key={flag.id}
                    className="p-3 rounded-lg bg-white border border-rose-200 space-y-1.5 text-xs shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-rose-900">
                        {flag.verdict}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200">
                        {flag.severity}
                      </span>
                    </div>
                    <p className="text-slate-800 italic">
                      Claimed: "{flag.claim}"
                    </p>
                    <p className="text-slate-600 text-[11px]">
                      {flag.explanation}
                    </p>
                    <div className="pt-1.5 border-t border-slate-100 text-[11px] text-indigo-700">
                      <span className="font-bold">
                        Recommended Probing Question:{" "}
                      </span>
                      <span>"{flag.probingQuestion}"</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths & Weaknesses Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-200 space-y-2">
              <h4 className="text-xs font-bold text-emerald-800 flex items-center space-x-1.5 uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Strengths</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {report?.strengths?.map((s, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-emerald-600 mt-0.5">•</span>
                    <span>{s}</span>
                  </li>
                )) || <li className="text-slate-400">No strengths logged</li>}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-200 space-y-2">
              <h4 className="text-xs font-bold text-amber-800 flex items-center space-x-1.5 uppercase tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Identified Gaps & Skill Needs</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {report?.weaknesses?.map((w, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>{w}</span>
                  </li>
                )) || <li className="text-slate-400">No weaknesses logged</li>}
              </ul>
            </div>
          </div>

          {/* Salary Expectation vs Market Benchmark */}
          {report?.salaryExpectation && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5 text-slate-500 font-semibold uppercase text-[10px]">
                  <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Salary Expectation Analysis (Naira ₦)</span>
                </div>
                <div className="text-slate-700">
                  Claimed:{" "}
                  <span className="font-mono text-slate-900 font-bold">
                    {report.salaryExpectation.claimed}
                  </span>
                  <span className="text-slate-400 mx-2">|</span>
                  Market Benchmark:{" "}
                  <span className="font-mono text-indigo-700 font-semibold">
                    {report.salaryExpectation.marketBenchmark}
                  </span>
                </div>
              </div>

              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                  report.salaryExpectation.assessment === "aligned"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}
              >
                {report.salaryExpectation.assessment.replace("_", " ")}
              </span>
            </div>
          )}

          {/* Candidate Developmental Feedback */}
          {report?.developmentalFeedback && (
            <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-2">
              <div className="flex items-center space-x-2 text-indigo-900 text-xs font-bold uppercase tracking-wider">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>
                  AI Candidate Developmental Feedback (Shared with Candidate on
                  Rejection / Feedback)
                </span>
              </div>
              <p className="text-xs text-indigo-950 leading-relaxed">
                "{report.developmentalFeedback}"
              </p>
            </div>
          )}

          {/* Raw CV Text Viewer */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Original Extracted CV Text
            </h4>
            <pre className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-700 max-h-48 overflow-y-auto whitespace-pre-wrap">
              {candidate.rawCvText}
            </pre>
          </div>
        </div>

        {/* Modal Action Bar */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500">Move to:</span>
            <select
              value={candidate.stage}
              onChange={(e) =>
                onUpdateStage(candidate.id, e.target.value as ApplicationStage)
              }
              className="bg-white text-slate-800 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="sourced">Sourced</option>
              <option value="screened">AI Screened</option>
              <option value="assessment">Skill Assessment</option>
              <option value="interview">Live Video Interview</option>
              <option value="reference">Reference Checks</option>
              <option value="offer">Offer Extended</option>
              <option value="hired">Hired 🎉</option>
              <option value="rejected">Rejected (Send Feedback)</option>
            </select>
          </div>

          <div className="flex items-center space-x-3">
            {candidate.stage === "hired" ? (
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                  Candidate Hired
                </span>
              </div>
            ) : candidate.stage === "rejected" ? (
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                Archived / Rejected
              </span>
            ) : (
              <>
                {candidate.stage !== "offer" && (
                  <button
                    onClick={() => {
                      onClose();
                      onStartInterview(candidate);
                    }}
                    className="flex items-center space-x-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg transition shadow-xs"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Launch Live Co-Pilot</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    onUpdateStage(candidate.id, "offer");
                    onClose();
                  }}
                  className="flex items-center space-x-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition shadow-xs"
                >
                  <Award className="w-3.5 h-3.5 text-white" />
                  <span>
                    {candidate.stage === "offer"
                      ? "View Offer"
                      : "Draft Offer Letter"}
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
