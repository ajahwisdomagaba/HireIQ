'use client';

import React, { useState, useEffect } from 'react';
import { Code2, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAssessments() {
      try {
        const res = await fetch('/api/v1/assessments');
        if (res.ok) {
          const data = await res.json();
          setAssessments(data.assessments || []);
        }
      } catch (err) {
        console.error('Failed to load assessments', err);
      } finally {
        setLoading(false);
      }
    }
    loadAssessments();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-slate-100">
      <div className="border-b border-slate-800/80 pb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Code2 className="h-6 w-6 text-emerald-400" /> Technical Assessments & Sandbox Runs
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Automated evaluation results, runtime complexities, and anti-cheat indicators.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading assessments...</div>
      ) : assessments.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
          No assessments configured yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assessments.map((item) => (
            <div key={item.id} className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                  <span className="text-[11px] font-mono text-emerald-400 mt-0.5 inline-block">
                    Role: {item.job?.title || 'General Engineering'}
                  </span>
                </div>
                <span className="flex items-center gap-1 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  <ShieldCheck className="h-3 w-3 text-emerald-400" /> Automated Rubric
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}