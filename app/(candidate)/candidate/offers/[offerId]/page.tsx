'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  DollarSign, 
  ShieldCheck, 
  Calendar, 
  AlertCircle, 
  Loader2, 
  PenTool, 
  RotateCcw 
} from 'lucide-react';

export default function CandidateOfferPage({ params }: { params: { offerId: string } }) {
  const offerId = params.offerId;
  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [signingMode, setSigningMode] = useState<'draw' | 'type'>('type');
  const [typedSignature, setTypedSignature] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const loadOffer = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await fetch(`/api/v1/offers/${offerId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const data = await res.json();
        setOffer(data.offer);
        if (data.offer.status === 'ACCEPTED') {
          setAccepted(true);
        }
        if (data.offer.application?.candidateProfile?.user?.name) {
          setTypedSignature(data.offer.application.candidateProfile.user.name);
        }
      } else {
        const err = await res.json().catch(() => ({}));
        setErrorMsg(err.error || 'Unable to retrieve offer letter details.');
      }
    } catch (e) {
      setErrorMsg('Network error retrieving offer details.');
    } finally {
      setLoading(false);
    }
  }, [offerId]);

  useEffect(() => {
    loadOffer();
  }, [loadOffer]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleAcceptOffer = async () => {
    if (signingMode === 'type' && !typedSignature.trim()) {
      alert('Please type your legal full name to sign.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/v1/offers/${offerId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        setAccepted(true);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to accept offer');
      }
    } catch (e) {
      alert('Network error submitting offer acceptance.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-400 font-mono text-xs">
        <Loader2 className="w-5 h-5 animate-spin mr-2 text-emerald-400" />
        Loading employment contract...
      </div>
    );
  }

  if (errorMsg || !offer) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-200">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold">Offer Not Found</h2>
          <p className="text-xs text-slate-400">{errorMsg || 'The requested offer does not exist.'}</p>
        </div>
      </div>
    );
  }

  const candidateName = offer.application?.candidateProfile?.user?.name || 'Candidate';
  const roleTitle = offer.application?.job?.title || 'Software Engineer';
  const annualSalary = offer.baseSalaryNGN || 30000000;
  const monthlySalary = Math.round(annualSalary / 12);
  const monthlyPension = Math.round(monthlySalary * 0.08);

  if (accepted) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="bg-[#0b1329] border border-emerald-500/30 rounded-3xl p-8 max-w-lg w-full text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Legally Executed
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-2">
              Welcome to the Team, {candidateName}!
            </h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Your digital signature has been recorded. Your employment status is officially updated to <strong>HIRED</strong>. The people operations team will reach out with your onboarding schedule.
            </p>
          </div>

          <div className="bg-[#050b18] p-4 rounded-2xl border border-slate-800 text-left space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Position:</span>
              <span className="text-white font-bold">{roleTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Monthly Compensation:</span>
              <span className="text-emerald-400 font-bold">₦{monthlySalary.toLocaleString()}/mo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Executed At:</span>
              <span className="text-slate-300">{new Date(offer.signedAt || Date.now()).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050b18] text-slate-100 py-10 px-4 sm:px-6 flex justify-center">
      <div className="max-w-4xl w-full space-y-8">
        
        {/* Header Title */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Employment Agreement & Offer</h1>
              <p className="text-xs text-slate-400 mt-0.5">Compliant with the Nigerian Labour Act (Cap L1, LFN 2004)</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-full font-mono">
            Pending Signature
          </span>
        </div>

        {/* Contract Document Body */}
        <div className="bg-[#0b1329] border border-slate-800 rounded-3xl p-8 sm:p-10 space-y-8 shadow-xl text-slate-300 text-xs leading-relaxed">
          
          <div className="border-b border-slate-800 pb-4 flex justify-between items-start text-slate-400 text-[11px]">
            <div>
              <p className="font-bold text-white text-sm">HireIQ Talent Network</p>
              <p>Lagos, Nigeria</p>
            </div>
            <div className="text-right font-mono">
              <p>Date: {new Date().toLocaleDateString()}</p>
              <p>Ref: {offer.id.slice(0, 12)}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-white mb-2">Dear {candidateName},</p>
            <p>
              We are pleased to offer you the position of <strong className="text-white">{roleTitle}</strong>. 
              This formal offer outlines the statutory compensation, benefits, and obligations governing your employment.
            </p>
          </div>

          {/* Statutory Compensation Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#050b18] border border-slate-800 p-4 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Gross Monthly
              </span>
              <div className="text-lg font-black text-emerald-400 font-mono">
                ₦{monthlySalary.toLocaleString()}
              </div>
              <p className="text-[10px] text-slate-500">₦{annualSalary.toLocaleString()} per annum</p>
            </div>

            <div className="bg-[#050b18] border border-slate-800 p-4 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Pension (PRA 2014)
              </span>
              <div className="text-lg font-black text-white font-mono">
                8% Statutory
              </div>
              <p className="text-[10px] text-slate-400">₦{monthlyPension.toLocaleString()}/mo to your RSA</p>
            </div>

            <div className="bg-[#050b18] border border-slate-800 p-4 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" /> Probation Period
              </span>
              <div className="text-lg font-black text-white font-mono">
                3 Months
              </div>
              <p className="text-[10px] text-slate-500">Standard performance check</p>
            </div>
          </div>

          {/* Contract Clauses */}
          <div className="space-y-4 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Terms & Key Provisions
            </h3>

            <div className="space-y-3">
              <div className="p-3 bg-[#050b18] rounded-xl border border-slate-800/80">
                <h4 className="font-bold text-white mb-1">1. FX Hedging & NAFEM Currency Adjustment</h4>
                <p className="text-slate-400 text-[11px]">
                  Compensation benchmarks are evaluated against CBN NAFEM rates. In the event of macro currency devaluation exceeding 15% within a bi-annual cycle, salary bands are subject to scheduled cost-of-living reviews.
                </p>
              </div>

              <div className="p-3 bg-[#050b18] rounded-xl border border-slate-800/80">
                <h4 className="font-bold text-white mb-1">2. Statutory Deductions & Tax Remittance</h4>
                <p className="text-slate-400 text-[11px]">
                  All statutory payroll remittances—including Pay-As-You-Earn (PAYE) to the relevant State Internal Revenue Service (e.g. LIRS) and Pension Reform Act deductions—will be deducted and credited directly to your registered PFA.
                </p>
              </div>

              <div className="p-3 bg-[#050b18] rounded-xl border border-slate-800/80">
                <h4 className="font-bold text-white mb-1">3. Health Insurance (HMO) & Leave Entitlement</h4>
                <p className="text-slate-400 text-[11px]">
                  Comprehensive medical coverage (Tier 1 HMO covering spouse and up to 2 dependents) activates from Day 1. You are entitled to 20 statutory working days of paid annual leave.
                </p>
              </div>
            </div>
          </div>

          {/* Signature Section */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-emerald-400" /> Candidate Legal Signature
              </h3>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSigningMode('type')}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    signingMode === 'type' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Type
                </button>
                <button
                  type="button"
                  onClick={() => setSigningMode('draw')}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    signingMode === 'draw' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Draw
                </button>
              </div>
            </div>

            {signingMode === 'type' ? (
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Type Full Legal Name
                </label>
                <input
                  type="text"
                  value={typedSignature}
                  onChange={(e) => setTypedSignature(e.target.value)}
                  className="w-full bg-[#050b18] border border-slate-700 rounded-xl px-4 py-3 text-lg font-serif italic text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative border border-slate-700 bg-[#050b18] rounded-xl overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={700}
                    height={150}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="w-full h-36 cursor-crosshair"
                  />
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Clear
                  </button>
                </div>
              </div>
            )}

            <p className="text-[10px] text-slate-500">
              By clicking "Accept & Sign Offer", you agree that your digital signature holds the same legal validity as a handwritten signature under the Nigerian Evidence Act.
            </p>

            <button
              type="button"
              onClick={handleAcceptOffer}
              disabled={isSubmitting}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xl transition disabled:opacity-50 mt-4"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Executing Agreement...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Accept & Sign Offer</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}