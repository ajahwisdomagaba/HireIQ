"use client";

import React, { useState } from 'react';
import { 
  Palette, 
  Layers, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  TrendingUp, 
  Zap, 
  Code, 
  Sliders, 
  Eye, 
  ArrowRight,
  UserCheck,
  Building2,
  Video
} from 'lucide-react';
import { ViewMode } from '@/types';

interface DesignSystemInspectorProps {
  onNavigateToView: (view: ViewMode) => void;
}

export const DesignSystemInspector: React.FC<DesignSystemInspectorProps> = ({ onNavigateToView }) => {
  const [activeTab, setActiveTab] = useState<'tokens' | 'components' | 'flows' | 'anti_slop'>('tokens');
  const [sampleScore, setSampleScore] = useState<number>(88);
  const [sampleInflationRisk, setSampleInflationRisk] = useState<'low' | 'moderate' | 'high'>('low');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 relative overflow-hidden shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center space-x-1">
                <Palette className="w-3 h-3 mr-1" /> Clean Minimalism Design System
              </span>
              <span className="text-xs text-slate-500">v3.0 Production Spec</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
              HireIQ NG Design Architecture
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl mt-1">
              Engineered for high-density recruitment intelligence in the Nigerian tech ecosystem. Strict clean minimalism, high-contrast typography, and specialized candidate scoring surfaces.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onNavigateToView('pipeline')}
              className="flex items-center space-x-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg shadow-xs transition"
            >
              <span>Test Live in ATS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex space-x-2 mt-6 border-b border-slate-200 pb-2">
          {[
            { id: 'tokens', label: '1. Design Tokens & Palette' },
            { id: 'components', label: '2. UI Component Archetypes' },
            { id: 'anti_slop', label: '3. Clean Minimalism Heuristics' },
            { id: 'flows', label: '4. Prototype User Flows' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                activeTab === tab.id
                  ? 'bg-slate-100 text-slate-900 border border-slate-200 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Design Tokens */}
      {activeTab === 'tokens' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Color swatches */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Primary Brand Indigo</h3>
              <div className="space-y-2">
                <div className="h-12 rounded-lg bg-indigo-600 flex items-end p-2 justify-between">
                  <span className="text-[11px] font-bold text-white">Indigo 600 (#4F46E5)</span>
                  <span className="text-[10px] text-indigo-100 font-mono">Primary Action</span>
                </div>
                <div className="h-10 rounded-lg bg-indigo-700 flex items-end p-2 justify-between">
                  <span className="text-[11px] font-bold text-white">Indigo 700 (#4338CA)</span>
                  <span className="text-[10px] text-indigo-200 font-mono">Hover State</span>
                </div>
                <div className="h-10 rounded-lg bg-indigo-50 border border-indigo-200 flex items-end p-2 justify-between">
                  <span className="text-[11px] font-bold text-indigo-700">Indigo 50 (#EEF2FF)</span>
                  <span className="text-[10px] text-indigo-500 font-mono">Subtle Tint</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Atmospheric Slate</h3>
              <div className="space-y-2">
                <div className="h-12 rounded-lg bg-slate-50 border border-slate-200 flex items-end p-2 justify-between">
                  <span className="text-[11px] font-bold text-slate-900">Slate 50 (#F8FAFC)</span>
                  <span className="text-[10px] text-slate-500 font-mono">App Canvas</span>
                </div>
                <div className="h-10 rounded-lg bg-white border border-slate-200 flex items-end p-2 justify-between">
                  <span className="text-[11px] font-bold text-slate-900">White (#FFFFFF)</span>
                  <span className="text-[10px] text-slate-500 font-mono">Card Base</span>
                </div>
                <div className="h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-end p-2 justify-between">
                  <span className="text-[11px] font-bold text-slate-700">Slate 100 (#F1F5F9)</span>
                  <span className="text-[10px] text-slate-500 font-mono">Border / Sub</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Inflation Risk Colors</h3>
              <div className="space-y-2">
                <div className="h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between px-3">
                  <span className="text-xs font-semibold text-emerald-700">Low Risk (Verified)</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between px-3">
                  <span className="text-xs font-semibold text-amber-700">Moderate Risk (Probe)</span>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
                <div className="h-10 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-between px-3">
                  <span className="text-xs font-semibold text-rose-700">High Risk (Inflated)</span>
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Typography Pairing</h3>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="font-display font-bold text-slate-900 text-sm">Space Grotesk</div>
                  <div className="text-[10px] text-slate-500">Headings, Metrics, Brand IQ</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="font-sans font-medium text-slate-800">Plus Jakarta Sans</div>
                  <div className="text-[10px] text-slate-500">Body, Candidate summaries, Labels</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="font-mono text-indigo-700 text-xs font-semibold">JetBrains Mono</div>
                  <div className="text-[10px] text-slate-500">Salaries (₦), MCP JSON, Code Sandbox</div>
                </div>
              </div>
            </div>
          </div>

          {/* Mathematical Corner Nesting & Padding Spec */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center space-x-2">
              <Code className="w-4 h-4 text-indigo-600" />
              <span>Mathematical Radius & Padding Nested Rules</span>
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              All container cards adhere strictly to: <code className="text-indigo-600 font-mono">Inner Radius = Outer Radius - Padding</code>.
              For an outer card of 12px radius with 8px padding, internal badge items maintain 4px radius to eliminate awkward corner collisions.
            </p>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 max-w-md">
              <div className="text-xs font-semibold text-slate-700 mb-2">Outer Card (radius: 12px, padding: 16px)</div>
              <div className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                <div className="text-xs text-slate-500">Inner Nesting (radius: 8px)</div>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                  Valid Math
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. UI Component Archetypes */}
      {activeTab === 'components' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Interactive Candidate Card Archetype */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Component: Candidate Screening Card</h3>
                <span className="text-[10px] font-mono text-slate-400">Molecule Spec</span>
              </div>

              {/* Dynamic Controls */}
              <div className="flex items-center space-x-4 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500">Score:</span>
                  <input
                    type="range"
                    min="40"
                    max="99"
                    value={sampleScore}
                    onChange={(e) => setSampleScore(Number(e.target.value))}
                    className="w-24 accent-indigo-600"
                  />
                  <span className="font-mono text-indigo-600 font-bold">{sampleScore}%</span>
                </div>

                <div className="flex items-center space-x-1">
                  <span className="text-slate-500">Risk:</span>
                  {(['low', 'moderate', 'high'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setSampleInflationRisk(r)}
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        sampleInflationRisk === r
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* The Live Rendered Component */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition shadow-2xs">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-indigo-600 font-display">
                      CO
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-900 text-sm">Chinedu Okafor</span>
                        <span className="text-[10px] text-slate-500 font-medium">UNILAG '20</span>
                      </div>
                      <p className="text-xs text-slate-500">Senior Backend Engineer · 5 yrs exp</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="font-display font-bold text-base text-indigo-600">{sampleScore}%</span>
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Match Score</span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono border border-slate-200">Node.js</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono border border-slate-200">PostgreSQL</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono border border-slate-200">Paystack API</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono border border-slate-200">Redis Lock</span>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5">
                    {sampleInflationRisk === 'low' && (
                      <span className="flex items-center space-x-1 text-emerald-700 text-[11px] font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>CV Verified · Low Risk</span>
                      </span>
                    )}
                    {sampleInflationRisk === 'moderate' && (
                      <span className="flex items-center space-x-1 text-amber-700 text-[11px] font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>1 Claim flagged for probing</span>
                      </span>
                    )}
                    {sampleInflationRisk === 'high' && (
                      <span className="flex items-center space-x-1 text-rose-700 text-[11px] font-medium">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                        <span>High Inflation Signal</span>
                      </span>
                    )}
                  </div>
                  <span className="text-slate-600 font-mono text-[11px] font-semibold">₦2.5M / mo</span>
                </div>
              </div>
            </div>

            {/* Live Interview Co-Pilot HUD Card Archetype */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Video className="w-4 h-4 text-rose-500" />
                  <span>Component: Real-Time Co-Pilot Probing HUD</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-400">Stream Molecule</span>
              </div>

              {/* Rendered Live HUD */}
              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 relative overflow-hidden space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Live AI Whisper to Interviewer</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200 font-semibold uppercase">
                    Urgent Drilldown
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-white border border-rose-100 text-xs space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Candidate Just Said:</span>
                  <p className="text-slate-800 italic">"I led a team of 15 engineers and managed all CBN compliance and switch routing."</p>
                </div>

                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 space-y-1">
                  <div className="flex items-center space-x-1 text-emerald-800 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Suggested Next Question:</span>
                  </div>
                  <p className="text-xs text-emerald-900 font-medium">
                    "What specific database locking mechanism did you use when handling concurrent NIBSS webhook deliveries during CBN switch downtime?"
                  </p>
                  <p className="text-[10px] text-slate-600 mt-1">
                    Rationale: Validates if candidate actually coded the switch or was merely an observer.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Anti-Slop Heuristics */}
      {activeTab === 'anti_slop' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-xs">
          <h3 className="text-base font-bold text-slate-900">HireIQ Clean Minimalism Compliance Check</h3>
          <p className="text-xs text-slate-600">
            Adheres strictly to human-grade craftsmanship principles: no purple-to-blue gradient clichés, zero glowing drop-shadows, mathematical nested border radius, crisp typography, and domain-calibrated Nigerian Naira compensation analytics.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-xs font-bold text-indigo-700 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Distinct Typography</span>
              </div>
              <p className="text-xs text-slate-600">Space Grotesk + Plus Jakarta Sans + JetBrains Mono for exact tabular readability.</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-xs font-bold text-indigo-700 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Domain Grounding</span>
              </div>
              <p className="text-xs text-slate-600">All assessments ground in real Nigerian frameworks (Paystack, Interswitch, NIBSS, LIRS, USSD).</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-xs font-bold text-indigo-700 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Deterministic JSON Schema</span>
              </div>
              <p className="text-xs text-slate-600">Backend Gemini agents output strictly structured JSON, never vague conversational prose.</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Prototype User Flows */}
      {activeTab === 'flows' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900">Full Platform Interactive Journey</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div 
              onClick={() => onNavigateToView('pipeline')}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-300 hover:shadow-sm cursor-pointer transition space-y-2 group"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition">
                <Layers className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600">1. AI Screening & ATS</h4>
              <p className="text-[11px] text-slate-500">Score 500+ CVs in seconds with inflation flags and candidate shortlists.</p>
            </div>

            <div 
              onClick={() => onNavigateToView('assessments')}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-300 hover:shadow-sm cursor-pointer transition space-y-2 group"
            >
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 group-hover:scale-105 transition">
                <Code className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-600">2. Skills Assessment</h4>
              <p className="text-[11px] text-slate-500">Practical Nigerian coding & situational sandbox with automated test evaluations.</p>
            </div>

            <div 
              onClick={() => onNavigateToView('live_interview')}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-rose-300 hover:shadow-sm cursor-pointer transition space-y-2 group"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 group-hover:scale-105 transition">
                <Video className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-rose-600">3. Live Video Co-Pilot</h4>
              <p className="text-[11px] text-slate-500">Real-time speech-to-text transcript with streaming AI suggested probing questions.</p>
            </div>

            <div 
              onClick={() => onNavigateToView('candidate_portal')}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-purple-300 hover:shadow-sm cursor-pointer transition space-y-2 group"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 group-hover:scale-105 transition">
                <UserCheck className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-purple-600">4. Candidate Portal</h4>
              <p className="text-[11px] text-slate-500">Developmental feedback reports for rejected applicants + ₦5k CV Doctor.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
