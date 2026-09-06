'use client';

import React, { useState, useEffect } from 'react';
import { Users, ArrowUpRight } from 'lucide-react';

export default function CandidatesPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCandidates() {
      try {
        const res = await fetch('/api/v1/applications');
        if (res.ok) {
          const data = await res.json();
          setApplications(data.applications || []);
        }
      } catch (err) {
        console.error('Failed to load candidate list', err);
      } finally {
        setLoading(false);
      }
    }
    loadCandidates();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-slate-100">
      <div className="border-b border-slate-800/80 pb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Users className="h-6 w-6 text-emerald-400" /> Candidate Pipeline & Ingestion
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review applied candidates, parsed skills, and technical assessment metrics.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading candidate pipeline...</div>
      ) : applications.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
          No candidates currently in the pipeline.
        </div>
      ) : (
        <div className="divide-y divide-slate-800/60 border border-slate-800/80 rounded-2xl bg-slate-900/60 overflow-hidden">
          {applications.map((app) => (
            <div key={app.id} className="p-5 flex items-center justify-between hover:bg-slate-800/30 transition-all">
              <div>
                <span className="text-sm font-semibold text-white block">
                  {app.candidateProfile?.user?.name || 'Unnamed Candidate'}
                </span>
                <span className="text-xs text-slate-400">
                  {app.job?.title || 'Applied Position'} • {app.candidateProfile?.location || 'Lagos, NG'}
                </span>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-xs font-mono uppercase px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {app.status}
                </span>
                <a
                  href={`/dashboard/jobs/${app.jobId}/pipeline`}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                >
                  Review Application <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}