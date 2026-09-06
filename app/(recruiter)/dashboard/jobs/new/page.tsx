"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Sliders,
  Plus,
  Trash2,
} from "lucide-react";

interface ParsedRequirements {
  title: string;
  department: string;
  employmentType: string;
  experienceLevel: string;
  location: string;
  requiredSkills: string[];
  preferredSkills: string[];
  minimumYearsExperience: number;
  educationRequirements: string;
  salaryRangeEstimateNGN: { min: number; max: number };
  screeningCriteria: {
    criteria: string;
    weight: number;
    evaluationNote: string;
  }[];
  nigerianMarketContextNotes: string;
}

export default function NewJobPage() {
  const router = useRouter();
  const [rawText, setRawText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<ParsedRequirements>({
    title: "",
    department: "Engineering",
    employmentType: "Full-Time",
    experienceLevel: "Mid-Level",
    location: "Lagos, Nigeria (Hybrid)",
    requiredSkills: [],
    preferredSkills: [],
    minimumYearsExperience: 3,
    educationRequirements: "Bachelor's degree or equivalent experience",
    salaryRangeEstimateNGN: { min: 700000, max: 1200000 },
    screeningCriteria: [],
    nigerianMarketContextNotes: "",
  });

  const [newRequiredSkill, setNewRequiredSkill] = useState("");

  const handleAiParse = async () => {
    if (!rawText.trim() || rawText.trim().length < 10) {
      setError(
        "Please paste a job description or prompt of at least 10 characters.",
      );
      return;
    }
    setError(null);
    setIsParsing(true);

    try {
      const res = await fetch("/api/v1/jobs/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawDescription: rawText }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || "AI failed to parse job description");
      }

      const d = result.data;
      setForm((prev) => ({
        ...prev,
        title: d.title || prev.title,
        department: d.department || prev.department,
        experienceLevel: d.experienceLevel || prev.experienceLevel,
        location: d.location || prev.location,
        employmentType: d.employmentType || prev.employmentType,
        requiredSkills: d.skills?.length ? d.skills : prev.requiredSkills,
        salaryRangeEstimateNGN: {
          min: d.salaryMin || prev.salaryRangeEstimateNGN.min,
          max: d.salaryMax || prev.salaryRangeEstimateNGN.max,
        },
      }));
    } catch (err: any) {
      setError(err.message || "Something went wrong during parsing");
    } finally {
      setIsParsing(false);
    }
  };

  const handleAddSkill = () => {
    if (
      newRequiredSkill.trim() &&
      !form.requiredSkills.includes(newRequiredSkill.trim())
    ) {
      setForm({
        ...form,
        requiredSkills: [...form.requiredSkills, newRequiredSkill.trim()],
      });
      setNewRequiredSkill("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setForm({
      ...form,
      requiredSkills: form.requiredSkills.filter((s) => s !== skill),
    });
  };

  const handleSaveJob = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          department: form.department,
          experienceLevel: form.experienceLevel,
          location: form.location,
          employmentType: form.employmentType,
          rawDescription: rawText || form.title,
          skills: form.requiredSkills,
          salaryMin: form.salaryRangeEstimateNGN.min,
          salaryMax: form.salaryRangeEstimateNGN.max,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create job requisition");
      }

      router.push("/dashboard/jobs");
    } catch (err: any) {
      setError(err.message || "Failed to publish job requisition");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 text-slate-100">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Create New Job Posting
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Paste your raw text or draft notes. HireIQ NG will extract structured
          requirements, scoring weights, and Nigerian salary bands.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-rose-400 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Raw Parser Input */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-4">
        <label className="text-sm font-medium text-slate-200 block">
          Raw Job Description or Outline
        </label>
        <textarea
          rows={6}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="Paste full JD, bullet points, or unstructured notes (e.g., 'Looking for a Senior Backend Dev with 4+ yrs in Node.js/PostgreSQL for a Lagos fintech...')"
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleAiParse}
            disabled={isParsing || !rawText.trim()}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl text-xs transition-all disabled:opacity-50 shadow-sm"
          >
            {isParsing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {isParsing
              ? "Calibrating Requirements..."
              : "Auto-Extract Requirements"}
          </button>
        </div>
      </div>

      {/* Structured Requirements Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-emerald-400" /> Core Job Details
          </h2>

          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Job Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-slate-200 focus:border-emerald-500/50 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Department
              </label>
              <input
                type="text"
                value={form.department}
                onChange={(e) =>
                  setForm({ ...form, department: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-slate-200 focus:border-emerald-500/50 outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Experience Level
              </label>
              <select
                value={form.experienceLevel}
                onChange={(e) =>
                  setForm({ ...form, experienceLevel: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-slate-200 focus:border-emerald-500/50 outline-none"
              >
                <option value="ENTRY">Junior</option>
                <option value="MID">Mid-Level</option>
                <option value="SENIOR">Senior</option>
                <option value="LEAD">Lead</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Location & Work Mode
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-slate-200 focus:border-emerald-500/50 outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Required Skills
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newRequiredSkill}
                onChange={(e) => setNewRequiredSkill(e.target.value)}
                placeholder="e.g. Node.js, PostgreSQL"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2 text-sm text-slate-200 outline-none focus:border-emerald-500/50"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm transition-all"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {form.requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 font-medium"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                  >
                    <Trash2 className="h-3 w-3 text-slate-400 hover:text-rose-400" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Screening Weights & Compensation */}
        <div className="space-y-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Sliders className="h-4 w-4 text-emerald-400" /> AI Screening
            Weights & Compensation
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Monthly Min (₦)
              </label>
              <input
                type="number"
                value={form.salaryRangeEstimateNGN.min}
                onChange={(e) =>
                  setForm({
                    ...form,
                    salaryRangeEstimateNGN: {
                      ...form.salaryRangeEstimateNGN,
                      min: Number(e.target.value),
                    },
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm font-mono text-emerald-400 outline-none focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Monthly Max (₦)
              </label>
              <input
                type="number"
                value={form.salaryRangeEstimateNGN.max}
                onChange={(e) =>
                  setForm({
                    ...form,
                    salaryRangeEstimateNGN: {
                      ...form.salaryRangeEstimateNGN,
                      max: Number(e.target.value),
                    },
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm font-mono text-emerald-400 outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-2">
              Automated Screening Scorecard
            </label>
            <div className="space-y-2">
              <div className="bg-slate-950/80 border border-slate-800/80 p-3 rounded-xl flex justify-between items-center text-xs">
                <div>
                  <p className="text-slate-200 font-medium">
                    Core Stack Proficiency
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Validates production runtime skills
                  </p>
                </div>
                <span className="font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                  40%
                </span>
              </div>
              <div className="bg-slate-950/80 border border-slate-800/80 p-3 rounded-xl flex justify-between items-center text-xs">
                <div>
                  <p className="text-slate-200 font-medium">
                    System Architecture & Scale
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Distributed throughput and caching
                  </p>
                </div>
                <span className="font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                  35%
                </span>
              </div>
              <div className="bg-slate-950/80 border border-slate-800/80 p-3 rounded-xl flex justify-between items-center text-xs">
                <div>
                  <p className="text-slate-200 font-medium">
                    Code Sandbox Performance
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Anti-cheat & algorithmic complexity
                  </p>
                </div>
                <span className="font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                  25%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-all"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSaveJob}
          disabled={isSaving || !form.title}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all disabled:opacity-50 shadow-sm"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          {isSaving ? "Publishing..." : "Save & Publish Job"}
        </button>
      </div>
    </div>
  );
}
