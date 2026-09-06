'use client';

import React from 'react';
import { 
  Users, 
  Briefcase, 
  Sparkles, 
  ShieldAlert, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  ChevronRight,
  Plus
} from 'lucide-react';
import { Candidate, Job } from '@/types';

interface DashboardOverviewProps {
  jobs: Job[];
  candidates: Candidate[];
  onOpenCreateJob: () => void;
  onOpenScreenModal: () => void;
  onSelectCandidate: (candidate: Candidate) => void;
  onSelectJob: (jobId: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  jobs,
  candidates,
  onOpenCreateJob,
  onOpenScreenModal,
  onSelectCandidate,
  onSelectJob,
}) => {
  const totalScreened = candidates.length;
  const highMatchCandidates = candidates.filter((c) => c.aiScore >= 80);
  const flaggedCandidates = candidates.filter((c) => c.inflationRisk === 'high' || c.inflationRisk === 'moderate');
  const avgAiScore = Math.round(
    candidates.reduce((acc, c) => acc + c.aiScore, 0) / (candidates.length || 1)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Quick Actions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active Hiring Workspace
            </span>
            <span className="text-xs text-slate-500">Nigeria Tech Ecosystem Calibrated</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">
            Recruitment Intelligence Dashboard
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
            Autonomous CV screening, authenticity & inflation heuristics, and real-time interview co-pilots for high-volume hiring teams.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={onOpenScreenModal}
            className="flex items-center space-x-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI Screen CVs</span>
          </button>

          <button
            onClick={onOpenCreateJob}
            className="flex items-center space-x-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl shadow-xs transition font-medium"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>Post New Role</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Openings</span>
            <Briefcase className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-900">{jobs.length}</div>
          <span className="text-[10px] text-slate-500 block">Across Lagos & Remote</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Evaluated</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-900">{totalScreened}</div>
          <span className="text-[10px] text-emerald-600 font-semibold block">Parsed via LLM & Affinda</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg Requirements Fit</span>
            <Sparkles className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold font-display text-indigo-600">{avgAiScore}%</div>
          <span className="text-[10px] text-slate-500 block">{highMatchCandidates.length} above 80% benchmark</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Inflation Signals</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold font-display text-rose-600">{flaggedCandidates.length}</div>
          <span className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded font-semibold inline-block">
            Exaggerations Flagged
          </span>
        </div>
      </div>

      {/* Main Grid: Active Roles & Shortlist Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Active Jobs */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-display">
              Active Job Pipelines
            </h3>
            <span className="text-xs text-slate-400">{jobs.length} open</span>
          </div>

          <div className="space-y-2.5">
            {jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => onSelectJob(job.id)}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-indigo-200 transition cursor-pointer flex items-center justify-between shadow-2xs"
              >
                <div className="space-y-1 pr-2">
                  <div className="font-semibold text-slate-900 text-xs">{job.title}</div>
                  <div className="text-[11px] text-slate-500 flex items-center space-x-2">
                    <span>{job.department}</span>
                    <span>•</span>
                    <span>{job.location}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-indigo-700 block">
                    {job.applicantsCount} apps
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold uppercase">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (7 Cols): Top AI-Ranked Candidates */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-display">
                Top AI-Ranked Shortlist
              </h3>
              <p className="text-[11px] text-slate-500">Ranked by real skills fit, local domain context & low inflation risk</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {candidates.slice(0, 5).map((candidate) => (
              <div
                key={candidate.id}
                onClick={() => onSelectCandidate(candidate)}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs transition cursor-pointer flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <img
                    src={candidate.avatar}
                    alt={candidate.name}
                    className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 text-xs truncate flex items-center space-x-2">
                      <span>{candidate.name}</span>
                      {candidate.inflationRisk === 'high' && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200 uppercase font-bold">
                          Flagged
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">{candidate.roleApplied}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <div className="text-right">
                    <div className="flex items-center space-x-1 justify-end">
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                      <span className="text-xs font-bold font-display text-indigo-600">
                        {candidate.aiScore}%
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 capitalize">{candidate.stage}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};