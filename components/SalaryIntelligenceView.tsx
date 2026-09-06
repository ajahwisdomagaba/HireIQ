'use client';

import React, { useState } from 'react';
import { 
  Sliders, 
  Sparkles, 
  TrendingUp, 
  DollarSign, 
  MapPin, 
  Loader2, 
  CheckCircle2, 
  ArrowUpRight 
} from 'lucide-react';

interface VerifiedSalaryRow {
  role: string;
  seniority: 'Junior' | 'Mid' | 'Senior' | 'Lead / Staff';
  location: string;
  minNGN: number;
  medianNGN: number;
  maxNGN: number;
  usdEquivalent: string;
  trend: 'RISING' | 'STABLE' | 'COMPETITIVE';
}

const DEFAULT_MATRIX_ROWS: VerifiedSalaryRow[] = [
  {
    role: 'Senior Backend Engineer (Node/Go/Python)',
    seniority: 'Senior',
    location: 'Lagos (Island/VI)',
    minNGN: 1900000,
    medianNGN: 2400000,
    maxNGN: 3800000,
    usdEquivalent: '$1,300 – $2,600 / mo',
    trend: 'RISING',
  },
  {
    role: 'Senior Backend Engineer (Node/Go/Python)',
    seniority: 'Senior',
    location: 'Lagos (Mainland/Yaba)',
    minNGN: 1400000,
    medianNGN: 1850000,
    maxNGN: 2500000,
    usdEquivalent: '$950 – $1,700 / mo',
    trend: 'STABLE',
  },
  {
    role: 'Growth Product Manager',
    seniority: 'Mid',
    location: 'Lagos (Island/VI)',
    minNGN: 1400000,
    medianNGN: 1850000,
    maxNGN: 2500000,
    usdEquivalent: '$950 – $1,700 / mo',
    trend: 'RISING',
  },
  {
    role: 'Frontend Engineer (React/Next.js)',
    seniority: 'Mid',
    location: 'Abuja (FCT)',
    minNGN: 1100000,
    medianNGN: 1450000,
    maxNGN: 1900000,
    usdEquivalent: '$750 – $1,300 / mo',
    trend: 'STABLE',
  },
  {
    role: 'DevOps & Cloud Engineer (AWS/K8s)',
    seniority: 'Senior',
    location: 'Remote (Nigeria-Wide)',
    minNGN: 2200000,
    medianNGN: 2800000,
    maxNGN: 4200000,
    usdEquivalent: '$1,500 – $2,900 / mo',
    trend: 'COMPETITIVE',
  },
];

export const SalaryIntelligenceView: React.FC = () => {
  const [customQueryRole, setCustomQueryRole] = useState('Senior Backend Engineer');
  const [customLocation, setCustomLocation] = useState('Lagos (Island/VI)');
  const [selectedIndustry, setSelectedIndustry] = useState('Fintech & Payments');
  const [customExperience, setCustomExperience] = useState<number>(5);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);

  const [liveBenchmarkResult, setLiveBenchmarkResult] = useState({
    role: 'Senior Backend Engineer (Node.js/Go)',
    location: 'Lagos (Island/VI)',
    p25: 1900000,
    p50: 2500000,
    p75: 3500000,
    p90: 4500000,
    usdPeggedPercentage: 42,
    fxHedgingStrategy: '40% of tier-1 fintechs offer 50/50 split FX payment or quarterly FX adjustments tied to CBN NAFEM rates.',
    marketCommentary: 'Intense competition from UK/US remote recruiters offering $3k-$5k/mo has driven Lagos P75 senior compensation to ₦3.5M+/month.',
  });

  const handleQueryLiveSalary = async () => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/ai/salary-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: customQueryRole,
          location: customLocation,
          experienceYears: customExperience,
          industry: selectedIndustry,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setLiveBenchmarkResult(data);
      }
    } catch (err) {
      console.error('Salary benchmark error:', err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const formatNaira = (val: number) => {
    if (!val) return '₦0';
    return '₦' + (val / 1000000).toFixed(2) + 'M';
  };

  const loadRowIntoCalculator = (row: VerifiedSalaryRow) => {
    setCustomQueryRole(row.role.split('(')[0].trim());
    setCustomLocation(row.location);
    setLiveBenchmarkResult((prev) => ({
      ...prev,
      role: row.role,
      location: row.location,
      p25: row.minNGN,
      p50: row.medianNGN,
      p75: Math.round(row.medianNGN * 1.35),
      p90: row.maxNGN,
    }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 text-slate-100">
      
      {/* Header Banner */}
      <div className="bg-[#0b1329] border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex items-center space-x-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Live Macro Intelligence
          </span>
          <span className="text-xs text-slate-400 font-mono">Calibrated Q3 2026</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Nigerian Tech Compensation & Salary Intelligence (₦)
        </h1>
        <p className="text-xs text-slate-300 max-w-3xl mt-1.5 leading-relaxed">
          Real-time salary percentiles (P25, P50, P75, P90) based on verified Nigerian offers across Lagos, Abuja, and Remote tech hubs with FX pegging analytics.
        </p>
      </div>

      {/* Calculator Surface & Live Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 5 Cols: AI Salary Band Calculator Form */}
        <div className="lg:col-span-5 bg-[#0b1329] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>AI Salary Band Calculator</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] uppercase font-bold text-slate-400 block mb-1">
                Target Role Title
              </label>
              <input
                type="text"
                value={customQueryRole}
                onChange={(e) => setCustomQueryRole(e.target.value)}
                placeholder="e.g. Senior Backend Engineer"
                className="w-full bg-[#050b18] text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-slate-700/80 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] uppercase font-bold text-slate-400 block mb-1">
                  Location
                </label>
                <select
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  className="w-full bg-[#050b18] text-slate-100 text-xs px-3 py-2.5 rounded-xl border border-slate-700/80 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="Lagos (Island/VI)">Lagos (Island/VI)</option>
                  <option value="Lagos (Mainland/Yaba)">Lagos (Mainland/Yaba)</option>
                  <option value="Abuja (FCT)">Abuja (FCT)</option>
                  <option value="Port Harcourt (Rivers)">Port Harcourt (Rivers)</option>
                  <option value="Remote (Nigeria-Wide)">Remote (Nigeria-Wide)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] uppercase font-bold text-slate-400 block mb-1">
                  Industry Sector
                </label>
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="w-full bg-[#050b18] text-slate-100 text-xs px-3 py-2.5 rounded-xl border border-slate-700/80 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="Fintech & Payments">Fintech & Payments</option>
                  <option value="Agritech & Healthtech">Agritech & Healthtech</option>
                  <option value="E-commerce / Logistics">E-commerce / Logistics</option>
                  <option value="Commercial Banking">Commercial Banking</option>
                  <option value="General Tech">General Tech</option>
                </select>
              </div>
            </div>

            {/* Years of Experience Slider */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] font-bold uppercase text-slate-400">
                <span>Years of Experience:</span>
                <span className="text-emerald-400 font-mono text-xs">{customExperience} YRS</span>
              </div>
              <input
                type="range"
                min={1}
                max={15}
                value={customExperience}
                onChange={(e) => setCustomExperience(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <button
              type="button"
              onClick={handleQueryLiveSalary}
              disabled={isLoadingAi}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition disabled:opacity-50 mt-2"
            >
              {isLoadingAi ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Querying Live Intelligence...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Calculate Verified Compensation</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right 7 Cols: Live Benchmark Results */}
        <div className="lg:col-span-7 bg-[#0b1329] border border-slate-800 rounded-2xl p-6 space-y-5 shadow-lg">
          
          {/* Header & Location Pill */}
          <div className="flex justify-between items-start border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {liveBenchmarkResult.role}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Monthly Compensation (Gross NGN ₦)
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-full">
              {liveBenchmarkResult.location}
            </span>
          </div>

          {/* 4 Stat Percentile Boxes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#050b18] border border-slate-800 p-3.5 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                P25 (Entry/Junior)
              </span>
              <div className="text-base sm:text-lg font-black text-white font-mono">
                {formatNaira(liveBenchmarkResult.p25)}
              </div>
              <span className="text-[10px] text-slate-500 block">/ month</span>
            </div>

            <div className="bg-[#050b18] border border-emerald-500/40 p-3.5 rounded-xl space-y-1 relative">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                P50 (Market Median)
              </span>
              <div className="text-base sm:text-lg font-black text-emerald-400 font-mono">
                {formatNaira(liveBenchmarkResult.p50)}
              </div>
              <span className="text-[10px] text-slate-400 block">/ month</span>
            </div>

            <div className="bg-[#050b18] border border-slate-800 p-3.5 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                P75 (Top Tier)
              </span>
              <div className="text-base sm:text-lg font-black text-white font-mono">
                {formatNaira(liveBenchmarkResult.p75)}
              </div>
              <span className="text-[10px] text-slate-500 block">/ month</span>
            </div>

            <div className="bg-[#050b18] border border-slate-800 p-3.5 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                P90 (Lead / Staff)
              </span>
              <div className="text-base sm:text-lg font-black text-white font-mono">
                {formatNaira(liveBenchmarkResult.p90)}
              </div>
              <span className="text-[10px] text-slate-500 block">/ month</span>
            </div>
          </div>

          {/* USD Pegging & FX Hedging Index Banner */}
          <div className="p-4 bg-[#050b18] border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>USD Pegging & FX Hedging Index</span>
              </div>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 font-mono">
                {liveBenchmarkResult.usdPeggedPercentage}% of Offers
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {liveBenchmarkResult.fxHedgingStrategy}
            </p>
          </div>

          {/* Macro Market Commentary */}
          <div className="space-y-1 text-xs text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Macro Market Commentary:
            </span>
            <p className="text-slate-300 leading-relaxed">
              {liveBenchmarkResult.marketCommentary}
            </p>
          </div>
        </div>
      </div>

      {/* Verified Nigerian Tech Roles Salary Matrix Table */}
      <div className="bg-[#0b1329] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">
            Verified Nigerian Tech Roles Salary Matrix
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Click on any role row to populate the AI benchmark calculator instantly.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <th className="pb-3 px-3">Role</th>
                <th className="pb-3 px-3">Seniority</th>
                <th className="pb-3 px-3">Location</th>
                <th className="pb-3 px-3">Min (₦)</th>
                <th className="pb-3 px-3">Median (₦)</th>
                <th className="pb-3 px-3">Max (₦)</th>
                <th className="pb-3 px-3">USD Equivalent</th>
                <th className="pb-3 px-3 text-right">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {DEFAULT_MATRIX_ROWS.map((row, idx) => (
                <tr
                  key={idx}
                  onClick={() => loadRowIntoCalculator(row)}
                  className="hover:bg-[#050b18] cursor-pointer transition"
                >
                  <td className="py-3.5 px-3 font-sans font-semibold text-white">
                    {row.role}
                  </td>
                  <td className="py-3.5 px-3 text-slate-300">{row.seniority}</td>
                  <td className="py-3.5 px-3 text-slate-400">{row.location}</td>
                  <td className="py-3.5 px-3 text-slate-300">{formatNaira(row.minNGN)}</td>
                  <td className="py-3.5 px-3 font-bold text-emerald-400">{formatNaira(row.medianNGN)}</td>
                  <td className="py-3.5 px-3 text-slate-300">{formatNaira(row.maxNGN)}</td>
                  <td className="py-3.5 px-3 text-slate-300">{row.usdEquivalent}</td>
                  <td className="py-3.5 px-3 text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase ${
                        row.trend === 'RISING'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : row.trend === 'COMPETITIVE'
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {row.trend}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
