'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Plus,
  MapPin,
  Building2,
  Users,
  ArrowUpRight,
  Share2,
} from 'lucide-react';
import MultiChannelBroadcastModal from '@/components/jobs/MultiChannelBroadcastModal';

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Multi-Channel Broadcast Modal States
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [selectedJobForBroadcast, setSelectedJobForBroadcast] = useState<{
    id: string;
    title: string;
    companyName: string;
  } | null>(null);

  useEffect(() => {
    async function loadJobs() {
      try {
        setLoading(true);
        const res = await fetch('/api/v1/jobs');
        if (res.ok) {
          const data = await res.json();
          setJobs(data.jobs || []);
        }
      } catch (err) {
        console.error('Failed to load requisitions', err);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-slate-100">
      {/* Top Banner Header */}
      <div className="flex justify-between items-center border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-emerald-400" />
            Job Requisitions & Pipelines
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage active roles, stage workflows, and candidate pipeline distribution.
          </p>
        </div>
        <Link
          href="/dashboard/jobs/new"
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm"
        >
          <Plus className="h-4 w-4" /> Create Requisition
        </Link>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading requisitions...</div>
      ) : jobs.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
          No job requisitions created yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-4 hover:border-slate-700 transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-semibold text-white">{job.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-500" /> {job.location}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-emerald-400">{job.employmentType}</span>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                  {job.status}
                </span>
              </div>

              {/* Bottom Card Actions */}
              <div className="flex justify-between items-center pt-3 border-t border-slate-800/60 text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-sky-400" />
                  <strong className="text-white">{job._count?.applications || 0}</strong> candidates
                </span>

                <div className="flex items-center gap-2">
                  {/* Multi-Channel Broadcast Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedJobForBroadcast({
                        id: job.id,
                        title: job.title,
                        companyName: job.company?.name || 'HireIQ Network',
                      });
                      setIsBroadcastModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg border border-slate-700/80 hover:border-slate-600 bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white transition flex items-center gap-1"
                    title="Broadcast to Telegram, LinkedIn & Jobberman"
                  >
                    <Share2 className="w-3.5 h-3.5 text-sky-400" />
                    <span className="text-[11px] font-semibold">Broadcast</span>
                  </button>

                  <Link
                    href={`/dashboard/jobs/${job.id}/pipeline`}
                    className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold ml-1"
                  >
                    View Pipeline <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Broadcast Modal Instance */}
      {selectedJobForBroadcast && (
        <MultiChannelBroadcastModal
          job={selectedJobForBroadcast}
          isOpen={isBroadcastModalOpen}
          onClose={() => {
            setIsBroadcastModalOpen(false);
            setSelectedJobForBroadcast(null);
          }}
        />
      )}
    </div>
  );
}