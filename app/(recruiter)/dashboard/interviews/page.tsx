'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Video, Calendar, ArrowUpRight, Mic, Loader2 } from 'lucide-react';

export default function LiveInterviewsPage() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInterviews() {
      try {
        const res = await fetch('/api/v1/interviews');
        if (res.ok) {
          const data = await res.json();
          setInterviews(data.interviews || []);
        }
      } catch (err) {
        console.error('Failed to load interviews', err);
      } finally {
        setLoading(false);
      }
    }
    loadInterviews();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-slate-100">
      <div className="flex justify-between items-start border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Video className="h-6 w-6 text-emerald-400" />
            Live Interview Studios & Real-Time Copilot
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time candidate video interviews, dynamic AI probing questions, and automatic transcript synthesis.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center font-mono text-slate-400 space-y-3">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
          <p className="text-xs">Fetching active interview sessions...</p>
        </div>
      ) : interviews.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl space-y-3">
          <p>No live or scheduled interview sessions currently in progress.</p>
          <p className="text-[11px] text-slate-600">
            Sessions generate automatically when candidates transition to the Interview stage in Kanban.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interviews.map((session) => (
            <div
              key={session.id}
              className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-4 hover:border-slate-700 transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {session.application?.candidateProfile?.user?.name || 'Candidate Interview'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {session.application?.job?.title || 'Engineering Requisition'}
                  </p>
                </div>
                <span className="flex items-center gap-1 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Mic className="h-3 w-3" /> Copilot Active
                </span>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-800/60 text-xs">
                <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  {new Date(session.scheduledAt || Date.now()).toLocaleDateString()}
                </span>
                <Link
                  href={`/dashboard/interviews/${session.id}`}
                  className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  Join Studio <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}