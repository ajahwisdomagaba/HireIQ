'use client';

import React from 'react';
import { Code2, Sparkles, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

interface CandidateCardProps {
  candidate: {
    id: string;
    name: string;
    role: string;
    stage: string;
    assessment?: {
      score: number;
      passed: boolean;
      aiLikelihood: 'LOW' | 'SUSPECTED' | 'HIGH';
    };
  };
}

export function KanbanCandidateCard({ candidate }: CandidateCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl space-y-3 cursor-grab transition-all">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-xs font-bold text-white">{candidate.name}</h4>
          <p className="text-[11px] text-slate-400">{candidate.role}</p>
        </div>
        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
          {candidate.stage}
        </span>
      </div>

      {/* Assessment Intelligence Integration */}
      {candidate.assessment ? (
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1.5 text-slate-300 font-mono">
            <Code2 className="h-3.5 w-3.5 text-emerald-400" />
            <strong className={candidate.assessment.passed ? 'text-emerald-400' : 'text-amber-400'}>
              {candidate.assessment.score}%
            </strong>
          </span>

          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                candidate.assessment.aiLikelihood === 'HIGH'
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}
            >
              AI: {candidate.assessment.aiLikelihood}
            </span>
          </div>
        </div>
      ) : (
        <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center gap-1">
          <Code2 className="h-3 w-3" /> No assessment submitted
        </div>
      )}
    </div>
  );
}