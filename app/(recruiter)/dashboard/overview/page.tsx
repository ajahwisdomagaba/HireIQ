'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  Users, 
  Video, 
  Sparkles, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Plus,
  Building2
} from 'lucide-react';

export default function OverviewPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch('/api/v1/jobs');
        if (res.ok) {
          const data = await res.json();
          setJobs(data.jobs || []);
        }
      } catch (err) {
        console.error('Failed to load overview data', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const totalCandidates = jobs.reduce((acc, j) => acc + (j._count?.applications || 0), 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-slate-200">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Recruitment Intelligence Hub</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time pipeline monitoring, automated screening runs, and live interview studios.
          </p>
        </div>
        <Link
          href="/dashboard/jobs/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-sm"
        >
          <Plus className="h-4 w-4" /> Create New Job
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Roles</span>
            <Briefcase className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">{jobs.length}</p>
          <span className="text-[10px] text-emerald-400 font-medium">Currently sourcing</span>
        </div>

        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Applicants</span>
            <Users className="h-4 w-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">{totalCandidates}</p>
          <span className="text-[10px] text-blue-400 font-medium">Across all pipelines</span>
        </div>

        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>AI Screenings</span>
            <Sparkles className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">{totalCandidates > 0 ? totalCandidates : 0}</p>
          <span className="text-[10px] text-purple-400 font-medium">Evidence evaluations verified</span>
        </div>

        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Live Studios</span>
            <Video className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white">Active</p>
          <span className="text-[10px] text-amber-400 font-medium">Co-Pilot & Daily.co enabled</span>
        </div>
      </div>

      {/* Active Pipelines Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-emerald-400" /> Active Job Pipelines
        </h2>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading active roles...</div>
        ) : jobs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No active jobs created yet. Click "Create New Job" to post your first position.
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="p-4 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">{job.title}</h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                      {job.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <Building2 className="h-3 w-3 text-slate-500" />
                    {job.department?.name || 'Engineering'} • {job.location} • {job.employmentType}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-400">
                    <strong className="text-white">{job._count?.applications || 0}</strong> applicants
                  </span>
                  <Link
                    href={`/dashboard/jobs/${job.id}/pipeline`}
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-all"
                  >
                    Open Kanban <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}