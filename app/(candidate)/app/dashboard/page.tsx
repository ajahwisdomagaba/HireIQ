'use client';

import { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Building2, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  Target, 
  Loader2 
} from 'lucide-react';

export default function CandidateDashboardPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  useEffect(() => {
    async function loadApplications() {
      try {
        const res = await fetch('/api/v1/candidate/applications');
        if (res.ok) {
          const data = await res.json();
          setApplications(data.applications || []);
        }
      } catch (err) {
        console.error('Failed to load applications', err);
      } finally {
        setLoading(false);
      }
    }
    loadApplications();
  }, []);

  const handleOpenFeedback = async (appId: string) => {
    setLoadingFeedback(true);
    try {
      const res = await fetch(`/api/v1/applications/${appId}/feedback`);
      if (res.ok) {
        const data = await res.json();
        setSelectedFeedback(data.report || data.roadmap);
      }
    } catch (err) {
      console.error('Failed to load growth roadmap', err);
    } finally {
      setLoadingFeedback(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 text-slate-200">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Candidate Career Hub</h1>
        <p className="text-sm text-slate-400">
          Track application progress, receive AI-generated skill gap analyses, and execute tailored upskilling roadmaps.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Application List */}
        <div className="lg:col-span-6 space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-emerald-400" /> Active Applications
          </h2>

          {loading ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" /> Loading applications...
            </div>
          ) : applications.length === 0 ? (
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-center text-xs text-slate-500">
              No active applications found.
            </div>
          ) : (
            applications.map((app) => (
              <div
                key={app.id}
                className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3 hover:border-slate-700 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-white text-sm">{app.job.title}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Building2 className="h-3 w-3 text-slate-500" /> {app.job.company.name} • {app.job.location}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {app.stage.replace('_', ' ')}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Applied {new Date(app.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleOpenFeedback(app.id)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> View Growth Roadmap
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Developmental Feedback & Roadmap Viewer */}
        <div className="lg:col-span-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Target className="h-4 w-4 text-emerald-400" /> AI Skill-Gap Analysis & Roadmap
            </h2>

            {loadingFeedback ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-400" />
                Generating personalized roadmap...
              </div>
            ) : selectedFeedback ? (
              <div className="space-y-5">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Synthesis</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedFeedback.executiveSummary}
                  </p>
                </div>

                {/* Phased Roadmap Timeline */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-emerald-400" /> Phased Upskilling Plan
                  </h4>
                  <div className="space-y-2.5">
                    {Array.isArray(selectedFeedback.growthRoadmap) &&
                      selectedFeedback.growthRoadmap.map((step: any, idx: number) => (
                        <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                          <div className="flex justify-between text-emerald-400 font-bold">
                            <span>{step.weekRange}</span>
                            <span>{step.focusArea}</span>
                          </div>
                          <p className="text-slate-300">{step.recommendedAction}</p>
                          <p className="text-[11px] text-slate-500 mt-1">
                            <strong className="text-slate-400">Project:</strong> {step.practicalProjectIdea}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-600 text-xs space-y-2">
                <Sparkles className="h-8 w-8 mx-auto opacity-30 text-slate-500" />
                <p>Select an application to explore its AI feedback and tailored upskilling curriculum.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}