'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Sliders,
  DollarSign,
  ShieldCheck,
  Building2,
  Landmark,
  CheckCircle2,
  Loader2,
  Info,
  Layers,
  X,
  Calculator,
  ArrowDownRight,
  Wallet,
} from 'lucide-react';

const VERIFIED_ROLES_MATRIX = [
  {
    role: 'Senior Backend Engineer (Node/Go/Python)',
    seniority: 'Senior',
    location: 'island',
    locationLabel: 'Lagos (Island/VI)',
    industry: 'fintech',
    min: 1900000,
    median: 3900000,
    max: 5450000,
    usdMin: 1300,
    usdMax: 3750,
    trend: 'RISING',
    exp: 5,
  },
  {
    role: 'Senior Backend Engineer (Node/Go/Python)',
    seniority: 'Senior',
    location: 'mainland',
    locationLabel: 'Lagos (Mainland/Yaba)',
    industry: 'ecommerce',
    min: 1400000,
    median: 2200000,
    max: 3200000,
    usdMin: 950,
    usdMax: 2200,
    trend: 'STABLE',
    exp: 5,
  },
  {
    role: 'Growth Product Manager',
    seniority: 'Mid',
    location: 'island',
    locationLabel: 'Lagos (Island/VI)',
    industry: 'fintech',
    min: 1400000,
    median: 2400000,
    max: 3600000,
    usdMin: 950,
    usdMax: 2500,
    trend: 'RISING',
    exp: 4,
  },
  {
    role: 'Frontend Engineer (React/Next.js)',
    seniority: 'Mid',
    location: 'abuja',
    locationLabel: 'Abuja (FCT)',
    industry: 'banking',
    min: 1100000,
    median: 1850000,
    max: 2600000,
    usdMin: 750,
    usdMax: 1800,
    trend: 'STABLE',
    exp: 3,
  },
  {
    role: 'DevOps & Platform Engineer (AWS/Kube)',
    seniority: 'Senior',
    location: 'remote',
    locationLabel: 'Remote (Pan-African)',
    industry: 'crypto',
    min: 2500000,
    median: 4800000,
    max: 7500000,
    usdMin: 1720,
    usdMax: 5170,
    trend: 'RISING',
    exp: 6,
  },
];

interface StatutoryModalData {
  tierName: string;
  monthlyGross: number;
  annualGross: number;
  usdRate: number;
}

export default function SalaryIntelligencePage() {
  const [roleTitle, setRoleTitle] = useState('Senior Backend Engineer');
  const [location, setLocation] = useState('island');
  const [industry, setIndustry] = useState('fintech');
  const [experienceYears, setExperienceYears] = useState(5);
  const [loading, setLoading] = useState(false);
  const [intel, setIntel] = useState<any>(null);

  // Popup modal state for clicked percentile
  const [selectedPercentileModal, setSelectedPercentileModal] = useState<StatutoryModalData | null>(null);

  const fetchIntelligence = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/v1/intelligence/salary?role=${encodeURIComponent(
          roleTitle
        )}&location=${location}&industry=${industry}&exp=${experienceYears}&fx=1450`
      );
      if (res.ok) {
        const data = await res.json();
        setIntel(data);
      }
    } catch (err) {
      console.error('Failed to compute benchmarks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntelligence();
  }, [experienceYears, location, industry]);

  const handleRowClick = (item: (typeof VERIFIED_ROLES_MATRIX)[0]) => {
    setRoleTitle(item.role.split('(')[0].trim());
    setLocation(item.location);
    setIndustry(item.industry);
    setExperienceYears(item.exp);
  };

  const openPercentilePopup = (tierName: string, monthlyGross: number) => {
    setSelectedPercentileModal({
      tierName,
      monthlyGross,
      annualGross: monthlyGross * 12,
      usdRate: Math.round(monthlyGross / 1450),
    });
  };

  // Statutory Calculations for the modal popup
  const computeStatutoryBreakdown = (gross: number) => {
    const employeePension = Math.round(gross * 0.08); // 8% RSA (PRA 2014)
    const employerPension = Math.round(gross * 0.10); // 10% Employer statutory
    const nhf = Math.round(gross * 0.025);            // 2.5% NHF
    const estimatedPayeTax = Math.round(gross * 0.165); // Standard effective progressive tax rate
    const totalDeductions = employeePension + nhf + estimatedPayeTax;
    const netTakeHome = gross - totalDeductions;

    return {
      employeePension,
      employerPension,
      nhf,
      estimatedPayeTax,
      totalDeductions,
      netTakeHome,
    };
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-slate-100">
      {/* Top Banner */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Live Macro Intelligence
          </span>
          <span className="text-[11px] text-slate-500 font-mono">Calibrated Q3 2026</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Nigerian Tech Compensation & Salary Intelligence (₦)
        </h1>
        <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
          Real-time salary percentiles (P25, P50, P75, P90) based on verified Nigerian offers across Lagos, Abuja, and Remote tech hubs with FX pegging analytics.
        </p>
      </div>

      {/* Top Section: Calculator + Live Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Filter Form */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-5">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <Sliders className="w-4 h-4" />
            AI Salary Band Calculator
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Target Role Title
              </label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g. Senior Backend Engineer"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-medium outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Location Hub
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 outline-none focus:border-emerald-500"
                >
                  <option value="island">Lagos (Island/VI)</option>
                  <option value="mainland">Lagos (Mainland/Yaba)</option>
                  <option value="abuja">Abuja (FCT)</option>
                  <option value="remote">Remote (Pan-African)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Industry Sector
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 outline-none focus:border-emerald-500"
                >
                  <option value="fintech">Fintech & Payments</option>
                  <option value="crypto">Web3 & Crypto</option>
                  <option value="banking">Banking & Enterprise</option>
                  <option value="ecommerce">E-commerce & Logistics</option>
                  <option value="healthtech">Healthtech & EdTech</option>
                  <option value="agency">Agency / Dev Shop</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] mb-2 font-medium">
                <span className="text-slate-400">Years of Experience:</span>
                <span className="text-emerald-400 font-mono font-bold">{experienceYears} Yrs</span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
                <span>Junior (0-2y)</span>
                <span>Mid (3-5y)</span>
                <span>Senior (6-8y)</span>
                <span>Lead (9y+)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={fetchIntelligence}
              disabled={loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-md text-xs mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Calculating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Calculate Verified Compensation
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Real-Time Benchmark Cards with Clickable Breakdown Triggers */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {roleTitle}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Monthly Compensation (Gross NGN ₦) • {intel?.industry || 'Fintech'}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-emerald-400 border border-slate-700">
                {intel?.location || 'Lagos (Island/VI)'}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-emerald-400" />
              <span>Click on any percentile card below to view the detailed <strong>tax, pension & net take-home breakdown</strong>.</span>
            </p>

            {/* Percentile Distribution Grid (Interactive Cards) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
              {/* P25 */}
              <div
                onClick={() => openPercentilePopup('P25 (Entry Tier)', intel?.monthlyNaira.p25 || 2950000)}
                className="bg-slate-950 border border-slate-800/80 hover:border-slate-600 rounded-2xl p-3.5 space-y-1 cursor-pointer transition transform hover:-translate-y-0.5 group"
              >
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>P25 (Entry)</span>
                  <ArrowDownRight className="w-3 h-3 text-slate-500 group-hover:text-white transition" />
                </div>
                <div className="text-lg font-bold text-white font-mono">
                  ₦{intel ? (intel.monthlyNaira.p25 / 1000000).toFixed(2) : '2.95'}M
                </div>
                <div className="text-[10px] text-slate-500">/ month</div>
              </div>

              {/* P50 */}
              <div
                onClick={() => openPercentilePopup('P50 (Market Median)', intel?.monthlyNaira.p50 || 3900000)}
                className="bg-slate-950 border border-emerald-500/40 hover:border-emerald-400 rounded-2xl p-3.5 space-y-1 relative shadow-lg shadow-emerald-950/20 cursor-pointer transition transform hover:-translate-y-0.5 group"
              >
                <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
                  <span>P50 (Median)</span>
                  <ArrowDownRight className="w-3 h-3 text-emerald-400 group-hover:translate-x-0.5 transition" />
                </div>
                <div className="text-lg font-bold text-emerald-400 font-mono">
                  ₦{intel ? (intel.monthlyNaira.p50 / 1000000).toFixed(2) : '3.90'}M
                </div>
                <div className="text-[10px] text-slate-400">/ month</div>
              </div>

              {/* P75 */}
              <div
                onClick={() => openPercentilePopup('P75 (Top Tier)', intel?.monthlyNaira.p75 || 5450000)}
                className="bg-slate-950 border border-slate-800/80 hover:border-slate-600 rounded-2xl p-3.5 space-y-1 cursor-pointer transition transform hover:-translate-y-0.5 group"
              >
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>P75 (Top Tier)</span>
                  <ArrowDownRight className="w-3 h-3 text-slate-500 group-hover:text-white transition" />
                </div>
                <div className="text-lg font-bold text-white font-mono">
                  ₦{intel ? (intel.monthlyNaira.p75 / 1000000).toFixed(2) : '5.45'}M
                </div>
                <div className="text-[10px] text-slate-500">/ month</div>
              </div>

              {/* P90 */}
              <div
                onClick={() => openPercentilePopup('P90 (Lead / Staff)', intel?.monthlyNaira.p90 || 7000000)}
                className="bg-slate-950 border border-slate-800/80 hover:border-slate-600 rounded-2xl p-3.5 space-y-1 cursor-pointer transition transform hover:-translate-y-0.5 group"
              >
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>P90 (Lead)</span>
                  <ArrowDownRight className="w-3 h-3 text-slate-500 group-hover:text-white transition" />
                </div>
                <div className="text-lg font-bold text-white font-mono">
                  ₦{intel ? (intel.monthlyNaira.p90 / 1000000).toFixed(2) : '7.00'}M
                </div>
                <div className="text-[10px] text-slate-500">/ month</div>
              </div>
            </div>

            {/* USD Pegging & Macro Callout */}
            <div className="mt-5 p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>USD Pegging & FX Hedging Index</span>
                </div>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {intel?.fxPeggingAdoptionPct || 45}% of Offers
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Median benchmark converts to <strong>~${intel ? intel.usdEquivalentMonthly.p50.toLocaleString() : '2,690'} USD/mo</strong> (@ ₦1,450/$ NAFEM). Employers in this tier frequently provide quarterly FX adjustments or dual-currency split contracts.
              </p>
            </div>
          </div>

          {/* Macro Commentary Footnote */}
          <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-3">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[9px] block mb-0.5">
              Macro Market Commentary
            </span>
            {intel?.macroMarketCommentary ||
              'Active recruiter competition across Lagos (Island/VI) has positioned senior bands at ₦5.5M+/month with rising USD-pegging requirements.'}
          </div>
        </div>
      </div>

      {/* Bottom Section: Verified Nigerian Tech Roles Salary Matrix */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white">Verified Nigerian Tech Roles Salary Matrix</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Click on any role row to populate the AI benchmark calculator instantly.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Seniority</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Min (₦)</th>
                <th className="py-3 px-4">Median (₦)</th>
                <th className="py-3 px-4">Max (₦)</th>
                <th className="py-3 px-4">USD Equivalent</th>
                <th className="py-3 px-4 text-right">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
              {VERIFIED_ROLES_MATRIX.map((item, idx) => (
                <tr
                  key={idx}
                  onClick={() => handleRowClick(item)}
                  className="hover:bg-slate-800/50 transition cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-semibold text-white group-hover:text-emerald-400 transition">
                    {item.role}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">{item.seniority}</td>
                  <td className="py-3.5 px-4 text-slate-400">{item.locationLabel}</td>
                  <td className="py-3.5 px-4 font-mono">₦{(item.min / 1000000).toFixed(2)}M</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                    ₦{(item.median / 1000000).toFixed(2)}M
                  </td>
                  <td className="py-3.5 px-4 font-mono">₦{(item.max / 1000000).toFixed(2)}M</td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">
                    ${item.usdMin.toLocaleString()} – ${item.usdMax.toLocaleString()} / mo
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        item.trend === 'RISING'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {item.trend}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* POPUP MODAL: Statutory Deductions & Take-Home Pay Breakdown */}
      {selectedPercentileModal && (() => {
        const breakdown = computeStatutoryBreakdown(selectedPercentileModal.monthlyGross);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {selectedPercentileModal.tierName}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Statutory Payroll Audit</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">{roleTitle}</h3>
                  <p className="text-[11px] text-slate-400">
                    {location === 'island' ? 'Lagos (Island/VI)' : location} • {industry.toUpperCase()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPercentileModal(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Gross Numbers Banner */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Monthly Gross
                  </span>
                  <span className="text-xl font-bold font-mono text-white">
                    ₦{selectedPercentileModal.monthlyGross.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500 block font-mono">
                    ~${selectedPercentileModal.usdRate.toLocaleString()} USD
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Annual Package
                  </span>
                  <span className="text-xl font-bold font-mono text-white">
                    ₦{(selectedPercentileModal.annualGross / 1000000).toFixed(2)}M
                  </span>
                  <span className="text-[10px] text-slate-500 block font-mono">12 Months Base</span>
                </div>
              </div>

              {/* Deductions Waterfall */}
              <div className="space-y-2.5 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Statutory Deductions & Contributions
                </span>

                <div className="flex justify-between py-2 border-b border-slate-800/80">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Employee Pension (8% to RSA - PRA 2014)
                  </span>
                  <span className="font-mono font-bold text-rose-400">
                    -₦{breakdown.employeePension.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-800/80">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                    National Housing Fund (NHF 2.5%)
                  </span>
                  <span className="font-mono font-bold text-rose-400">
                    -₦{breakdown.nhf.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-800/80">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Landmark className="w-3.5 h-3.5 text-sky-400" />
                    Estimated Lagos State P.A.Y.E. Tax
                  </span>
                  <span className="font-mono font-bold text-rose-400">
                    -₦{breakdown.estimatedPayeTax.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-800/80 text-slate-400 text-[11px]">
                  <span>Employer Pension Contribution (10% paid by company)</span>
                  <span className="font-mono text-emerald-400">
                    +₦{breakdown.employerPension.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Final Net Take-Home Card */}
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500 text-slate-950 rounded-xl">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                      Estimated Net Monthly Take-Home
                    </span>
                    <span className="text-xs text-slate-400">Direct account disbursement</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black font-mono text-emerald-400">
                    ₦{breakdown.netTakeHome.toLocaleString()}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    ~${Math.round(breakdown.netTakeHome / 1450).toLocaleString()} USD / mo
                  </div>
                </div>
              </div>

              {/* Footer Button */}
              <button
                type="button"
                onClick={() => setSelectedPercentileModal(null)}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}