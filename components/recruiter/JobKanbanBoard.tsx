'use client';

import React, { useState, useEffect } from 'react';

interface CandidateCard {
  id: string;
  stage: string;
  candidateProfile: {
    user: { name: string; email: string };
    phoneNumber: string | null;
    headline: string | null;
  };
  screeningSessions?: {
    overallScore: number;
    verdict: string;
    summaryReasoning: string;
  }[];
}

interface PipelineResponse {
  job: { id: string; title: string };
  pipeline: Record<string, CandidateCard[]>;
  totalCount: number;
}

const STAGES = ['APPLIED', 'AI_SCREENED', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'];

const VERDICT_COLORS: Record<string, string> = {
  STRONG_HIRE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  INTERVIEW: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  BORDERLINE_REVIEW: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  REJECT: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

export default function JobKanbanBoard({ jobId }: { jobId: string }) {
  const [data, setData] = useState<PipelineResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);

  const fetchPipeline = async () => {
    try {
      const res = await fetch(`/api/v1/jobs/${jobId}/applications`);
      const json = await res.json();
      if (json.success) setData(json);
    } catch (err) {
      console.error('Failed to load pipeline:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipeline();
  }, [jobId]);

  const moveStage = async (applicationId: string, targetStage: string) => {
    try {
      const res = await fetch(`/api/v1/applications/${applicationId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetStage }),
      });
      if (res.ok) {
        await fetchPipeline();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update stage');
      }
    } catch (err) {
      console.error('Stage transition failed:', err);
    }
  };

  const openReport = async (applicationId: string) => {
    setSelectedAppId(applicationId);
    setReportLoading(true);
    try {
      const res = await fetch(`/api/v1/applications/${applicationId}/report`, {
        method: 'POST',
      });
      const json = await res.json();
      if (json.success) setReportData(json.report);
    } catch (err) {
      console.error('Failed to fetch report:', err);
    } finally {
      setReportLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-neutral-400 font-mono">Loading Candidate Pipeline...</div>;
  if (!data) return <div className="p-8 text-rose-400 font-mono">Failed to load requisition pipeline.</div>;

  return (
    <div className="flex flex-col h-screen bg-neutral-950 text-neutral-100 p-6 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{data.job.title}</h1>
          <p className="text-sm text-neutral-400">Total Applicants: {data.totalCount}</p>
        </div>
        <button
          onClick={fetchPipeline}
          className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs rounded border border-neutral-700 transition"
        >
          Refresh Board
        </button>
      </div>

      {/* Kanban Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
        {STAGES.map((stage) => {
          const cards = data.pipeline[stage] || [];
          return (
            <div
              key={stage}
              className="w-80 flex-shrink-0 bg-neutral-900/60 rounded-xl border border-neutral-800 flex flex-col max-h-full"
            >
              <div className="p-3 border-b border-neutral-800/80 flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-300 tracking-wider">
                  {stage.replace('_', ' ')}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 font-mono">
                  {cards.length}
                </span>
              </div>

              <div className="p-3 overflow-y-auto space-y-3 flex-1">
                {cards.map((card) => {
                  const screening = card.screeningSessions?.[0];
                  return (
                    <div
                      key={card.id}
                      className="p-3.5 bg-neutral-900 rounded-lg border border-neutral-800 hover:border-neutral-700 transition shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-sm text-white truncate max-w-[170px]">
                          {card.candidateProfile?.user?.name || 'Unknown Candidate'}
                        </span>
                        {screening && (
                          <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-200">
                            {screening.overallScore}%
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-neutral-400 truncate mb-2">
                        {card.candidateProfile?.user?.email}
                      </p>

                      {screening?.verdict && (
                        <div className="mb-3">
                          <span
                            className={`text-[10px] px-2 py-0.5 font-mono rounded border uppercase ${
                              VERDICT_COLORS[screening.verdict] || 'bg-neutral-800 text-neutral-400'
                            }`}
                          >
                            {screening.verdict.replace('_', ' ')}
                          </span>
                        </div>
                      )}

                      {/* Card Actions */}
                      <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between">
                        <button
                          onClick={() => openReport(card.id)}
                          className="text-[11px] text-blue-400 hover:text-blue-300 transition underline underline-offset-2"
                        >
                          View AI Report
                        </button>

                        <div className="flex gap-1">
                          {stage === 'AI_SCREENED' && (
                            <button
                              onClick={() => moveStage(card.id, 'INTERVIEW')}
                              className="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 rounded border border-emerald-500/30 transition"
                            >
                              Interview →
                            </button>
                          )}
                          {stage === 'INTERVIEW' && (
                            <button
                              onClick={() => moveStage(card.id, 'OFFER')}
                              className="px-2 py-0.5 text-[10px] bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 rounded border border-purple-500/30 transition"
                            >
                              Offer →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Report Modal */}
      {selectedAppId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-neutral-800 flex justify-between items-center">
              <h3 className="font-semibold text-white">AI Candidate Intelligence Dossier</h3>
              <button
                onClick={() => {
                  setSelectedAppId(null);
                  setReportData(null);
                }}
                className="text-neutral-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-sm">
              {reportLoading ? (
                <div className="py-12 text-center text-neutral-400 font-mono">
                  Synthesizing candidate briefing...
                </div>
              ) : reportData ? (
                <>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-white font-mono">
                      {reportData.matchScore}%
                    </span>
                    <span
                      className={`text-xs px-2.5 py-1 font-mono rounded border uppercase ${
                        VERDICT_COLORS[reportData.verdict] || 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {reportData.verdict}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs uppercase font-mono text-neutral-400 mb-1">
                      Executive Summary
                    </h4>
                    <p className="text-neutral-300 leading-relaxed bg-neutral-950 p-3 rounded-lg border border-neutral-800/60">
                      {reportData.executiveSummary}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs uppercase font-mono text-emerald-400 mb-2">
                        Strengths
                      </h4>
                      <ul className="space-y-1.5">
                        {reportData.strengths?.map((s: string, idx: number) => (
                          <li key={idx} className="text-xs text-neutral-300 flex items-start gap-1.5">
                            <span className="text-emerald-400">✓</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xs uppercase font-mono text-amber-400 mb-2">
                        Areas of Caution / Gaps
                      </h4>
                      <ul className="space-y-1.5">
                        {reportData.weaknesses?.map((w: string, idx: number) => (
                          <li key={idx} className="text-xs text-neutral-300 flex items-start gap-1.5">
                            <span className="text-amber-400">⚠</span> {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs uppercase font-mono text-neutral-400 mb-1">
                      Suggested Salary Band
                    </h4>
                    <p className="font-mono text-xs text-neutral-200">{reportData.marketSalaryBand}</p>
                  </div>
                </>
              ) : (
                <div className="text-rose-400">Failed to render report.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}