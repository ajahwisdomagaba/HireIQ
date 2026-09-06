"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  Loader2,
  Search,
  Plus,
  Radio,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import CandidateScorecardModal from "@/components/CandidateScorecardModal";

const PIPELINE_COLUMNS = [
  { key: "APPLIED", label: "SOURCED / APPLIED" },
  { key: "AI_SCREENED", label: "AI SCREENED" },
  { key: "ASSESSMENT", label: "SKILL ASSESSMENT" },
  { key: "INTERVIEW", label: "LIVE VIDEO INTERVIEW" },
  { key: "REFERENCE", label: "REFERENCE CHECKS" },
  { key: "OFFER", label: "OFFER EXTENDED" },
  { key: "HIRED", label: "HIRED" },
];

export default function JobPipelineClient({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [jobsList, setJobsList] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  // Filter Bar Controls
  const [searchQuery, setSearchQuery] = useState("");
  const [inflationFilter, setInflationFilter] = useState("ALL");

  const fetchPipelineData = async () => {
    try {
      setLoading(true);

      // Fetch applications for this requisition
      const res = await fetch(`/api/v1/jobs/${jobId}/applications`);
      if (res.ok) {
        const data = await res.json();
        setJob(data.job);
        setApplications(data.applications || []);
      }

      // Fetch jobs list for the role switcher dropdown
      const jobsRes = await fetch(`/api/v1/jobs`);
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setJobsList(jobsData.jobs || []);
      }
    } catch (err) {
      console.error("Failed to fetch pipeline data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelineData();
  }, [jobId]);

  const handleMoveStage = async (applicationId: string, newStage: string) => {
    try {
      const res = await fetch(`/api/v1/applications/${applicationId}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetStage: newStage,
          reason: `Progressed to ${newStage} via ATS Pipeline Board`,
        }),
      });

      if (res.ok) {
        fetchPipelineData();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Failed to update candidate stage");
      }
    } catch (err) {
      console.error("Failed to update stage", err);
    }
  };

  // Filter logic across search queries and authenticity status
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const name = app.candidateProfile?.user?.name?.toLowerCase() || "";
      const email = app.candidateProfile?.user?.email?.toLowerCase() || "";
      const headline = app.candidateProfile?.headline?.toLowerCase() || "";
      const skills = app.candidateProfile?.skills?.map((s: any) => s.name.toLowerCase()).join(" ") || "";
      
      const matchesSearch =
        !searchQuery ||
        name.includes(searchQuery.toLowerCase()) ||
        email.includes(searchQuery.toLowerCase()) ||
        headline.includes(searchQuery.toLowerCase()) ||
        skills.includes(searchQuery.toLowerCase());

      const score = app.screeningSessions?.[0]?.overallScore ?? 85;
      const isHighInflation = score < 70 || (app.screeningSessions?.[0]?.inflationSignals?.length ?? 0) > 0;

      if (inflationFilter === "HIGH" && !isHighInflation) return false;
      if (inflationFilter === "LOW" && isHighInflation) return false;

      return matchesSearch;
    });
  }, [applications, searchQuery, inflationFilter]);

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center p-8 text-slate-500 font-mono text-xs">
        <Loader2 className="h-5 w-5 animate-spin mr-2 text-indigo-600" />
        Loading pipeline workspace...
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col p-6 space-y-4 bg-slate-50 text-slate-800">
      
      {/* Top Filter & Actions Toolbar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard/jobs")}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs flex items-center gap-1 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          {/* Dynamic Role Dropdown */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-500">Role:</span>
            <select
              value={jobId}
              onChange={(e) => router.push(`/dashboard/jobs/${e.target.value}/pipeline`)}
              className="bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold rounded-xl px-3 py-1.5 focus:border-indigo-600 outline-none shadow-sm cursor-pointer"
            >
              {jobsList.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} ({j._count?.applications || applications.length} candidates)
                </option>
              ))}
            </select>
          </div>

          {/* Inflation Risk Filter */}
          <div className="flex items-center gap-1.5 text-xs ml-2">
            <span className="font-semibold text-slate-500">Inflation Risk:</span>
            <select
              value={inflationFilter}
              onChange={(e) => setInflationFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold rounded-xl px-3 py-1.5 focus:border-indigo-600 outline-none shadow-sm cursor-pointer"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="LOW">Low Risk (Verified)</option>
              <option value="HIGH">High Inflation Flagged</option>
            </select>
          </div>
        </div>

        {/* Search & Screen New CV */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search candidate, skill, UNILAG..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 bg-slate-50 border border-slate-300 text-slate-900 text-xs pl-9 pr-3 py-2 rounded-xl focus:border-indigo-600 outline-none shadow-sm"
            />
          </div>

          <button
            onClick={() => router.push(`/dashboard/jobs/${jobId}/applicants`)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" /> Screen New CV
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Kanban Columns */}
      <div className="flex-1 flex gap-4 overflow-x-auto pb-4 pt-1 items-stretch">
        {PIPELINE_COLUMNS.map((col) => {
          const appsInStage = filteredApplications.filter((a: any) => {
            if (col.key === "REFERENCE") {
              return a.stage === "REFERENCE" || (a.stage === "INTERVIEW" && a.referenceChecksDispatched);
            }
            return a.stage === col.key;
          });

          return (
            <div
              key={col.key}
              className="w-80 shrink-0 bg-slate-100/70 border border-slate-200/90 rounded-2xl flex flex-col p-3 shadow-sm"
            >
              {/* Column Header */}
              <div className="flex justify-between items-center mb-3 px-1">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  {col.label}
                </span>
                <span className="text-xs bg-white text-slate-600 border border-slate-200 font-bold px-2 py-0.5 rounded-full shadow-2xs">
                  {appsInStage.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-0.5">
                {appsInStage.length === 0 ? (
                  <div className="h-36 flex items-center justify-center border border-dashed border-slate-300 rounded-xl text-center text-xs text-slate-400 p-4">
                    No candidates in this stage
                  </div>
                ) : (
                  appsInStage.map((app: any) => {
                    const profile = app.candidateProfile;
                    const user = profile?.user;
                    const screening = app.screeningSessions?.[0];
                    const score = screening?.overallScore ?? 85;
                    const isHighInflation = score < 70 || (screening?.inflationSignals?.length ?? 0) > 0;

                    const candidateSkills = profile?.skills?.map((s: any) => s.name) || [
                      "Node.js",
                      "React",
                      "TypeScript",
                    ];

                    return (
                      <div
                        key={app.id}
                        onClick={() => setSelectedAppId(app.id)}
                        className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer space-y-3"
                      >
                        {/* Top: Name, Location & Authenticity Score */}
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 leading-tight">
                              {user?.name || "Candidate"}
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {profile?.location || "Lagos, Nigeria"}
                            </p>
                          </div>

                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                              score >= 75
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {score}%
                          </span>
                        </div>

                        {/* Title & Dynamic Skill Pills */}
                        <div>
                          <p className="text-[11px] font-medium text-slate-700 truncate">
                            {profile?.headline || app.job?.title || "Software Engineer"}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {candidateSkills.slice(0, 3).map((sk: string, idx: number) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200"
                              >
                                {sk}
                              </span>
                            ))}
                            {candidateSkills.length > 3 && (
                              <span className="text-[10px] bg-slate-50 text-slate-400 px-1.5 py-0.5 rounded border border-slate-200">
                                +{candidateSkills.length - 3}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Authenticity Pill & Stage Trigger Button */}
                        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                          {isHighInflation ? (
                            <span className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> Inflation Risk
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Verified
                            </span>
                          )}

                          {/* Dynamic Stage Progression Actions */}
                          {col.key === "APPLIED" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveStage(app.id, "AI_SCREENED");
                              }}
                              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                            >
                              Screen <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                          {col.key === "AI_SCREENED" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveStage(app.id, "ASSESSMENT");
                              }}
                              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                            >
                              Send Test →
                            </button>
                          )}
                          {col.key === "ASSESSMENT" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveStage(app.id, "INTERVIEW");
                              }}
                              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                            >
                              Interview →
                            </button>
                          )}
                          {col.key === "INTERVIEW" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/dashboard/interviews`);
                              }}
                              className="text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200 px-2 py-1 rounded-lg flex items-center gap-1 hover:bg-rose-100"
                            >
                              <Radio className="w-3 h-3 animate-pulse" /> Start Room
                            </button>
                          )}
                          {col.key === "REFERENCE" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveStage(app.id, "OFFER");
                              }}
                              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                            >
                              Extend Offer →
                            </button>
                          )}
                          {col.key === "OFFER" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/dashboard/offers`);
                              }}
                              className="text-[11px] font-bold text-amber-600 hover:text-amber-800 flex items-center gap-1"
                            >
                              Offer &gt;
                            </button>
                          )}
                          {col.key === "HIRED" && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Hired
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Candidate Scorecard Inspector Modal */}
      {selectedAppId && (
        <CandidateScorecardModal
          applicationId={selectedAppId}
          onClose={() => setSelectedAppId(null)}
          onStageChange={(newStage: string) => {
            handleMoveStage(selectedAppId, newStage);
            setSelectedAppId(null);
          }}
        />
      )}
    </div>
  );
}