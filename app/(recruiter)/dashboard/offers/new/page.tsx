"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  FileDown,
  Loader2,
  AlertCircle,
  MessageSquare,
  Send,
  Mail,
  Phone,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";

interface EligibleCandidate {
  applicationId: string;
  candidateName: string;
  jobTitle: string;
  currentStage: string;
}

export default function OfferGeneratorPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"offer" | "ref_checks">("offer");
  const [eligibleCandidates, setEligibleCandidates] = useState<
    EligibleCandidate[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sending, setSending] = useState(false);

  // Form Fields
  const [selectedAppId, setSelectedAppId] = useState("");
  const [monthlyGross, setMonthlyGross] = useState<number>(2800000);
  const [fxPegging, setFxPegging] = useState<boolean>(true);
  const [equityOptions, setEquityOptions] = useState<string>(
    "0.25% Stock Options (4-year vesting, 1-year cliff)",
  );
  const [startDate, setStartDate] = useState<string>("2026-09-15");
  const [validityDays, setValidityDays] = useState<number>(7);

  // State of generated draft
  const [draftedOffer, setDraftedOffer] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  // Reference Check Form Fields
  const [channelDelivery, setChannelDelivery] = useState<"whatsapp" | "email">(
    "whatsapp",
  );
  const [refereeName, setRefereeName] = useState(
    "Engr. Babafemi Alabi (VP Engineering, Kuda Bank)",
  );
  const [refereePhone, setRefereePhone] = useState("+234 802 334 9912");
  const [refereeEmail, setRefereeEmail] = useState(
    "babafemi.alabi@kudabank.ng",
  );

  const nafemRate = 1450;

  const portalUrl = `${window.location.origin}/ref/verify/${selectedAppId}`;
  useEffect(() => {
    async function loadCandidates() {
      try {
        setLoading(true);
        const res = await fetch("/api/v1/offers");
        if (res.ok) {
          const data = await res.json();
          const candidates: EligibleCandidate[] = data.eligibleCandidates || [];
          setEligibleCandidates(candidates);
          if (candidates.length > 0) {
            setSelectedAppId(candidates[0].applicationId);
          }
        }
      } catch (err) {
        console.error("Failed to load eligible candidates:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCandidates();
  }, []);

  const selectedCandidate = useMemo(() => {
    return (
      eligibleCandidates.find((c) => c.applicationId === selectedAppId) || null
    );
  }, [eligibleCandidates, selectedAppId]);

  const annualGross = monthlyGross * 12;
  const usdEquivalent = Math.round(monthlyGross / nafemRate);
  const employeePension = Math.round(monthlyGross * 0.08);
  const employerPension = Math.round(monthlyGross * 0.1);

  // 1. Generate Draft
  const handleGenerateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: selectedAppId,
          baseSalaryNGN: annualGross,
          validityDays,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDraftedOffer(data.offer);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Failed to generate draft offer document.");
      }
    } catch (err) {
      alert("Network error while generating draft offer.");
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Dispatch to Candidate
  const handleDispatchOffer = async () => {
    if (!draftedOffer) return;

    setSending(true);
    try {
      const res = await fetch(`/api/v1/offers/${draftedOffer.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ validityDays }),
      });

      if (res.ok) {
        router.push("/dashboard/offers");
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Failed to dispatch offer.");
      }
    } catch (err) {
      alert("Network error while sending offer.");
    } finally {
      setSending(false);
    }
  };

  const handleCopySigningUrl = () => {
    if (!draftedOffer) return;
    const url = `${window.location.origin}/candidate/offers/${draftedOffer.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-slate-500 font-mono text-xs">
        <Loader2 className="w-5 h-5 animate-spin mr-2 text-indigo-600" />
        Loading workspace & candidates...
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-offer-document,
          #printable-offer-document * {
            visibility: visible;
          }
          #printable-offer-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 24px;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link
            href="/dashboard/offers"
            className="hover:text-white flex items-center gap-1 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Offers
          </Link>
          <span>/</span>
          <span className="text-slate-200">
            {activeTab === "offer"
              ? "Draft Statutory Offer"
              : "Reference Checks"}
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              Closing & Compliance Module
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-2">
              Statutory Offer Drafter & Verification
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Draft compliant offer contracts, review clauses, and trigger
              dispatch when approved.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("ref_checks")}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                activeTab === "ref_checks"
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              WhatsApp Ref Checks
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("offer")}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                activeTab === "offer"
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Draft Offer Contract
            </button>
          </div>
        </div>

        {activeTab === "offer" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Offer Configuration
                </h2>
              </div>

              {/* Draft Status Banner when an offer is drafted */}
              {draftedOffer && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Draft Ready for Dispatch
                    </span>
                    <span className="text-[10px] font-mono bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">
                      STATUS: DRAFT
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-900 leading-relaxed">
                    This document is saved as a draft and is{" "}
                    <strong>not yet accessible</strong> to the candidate. Click
                    below to officially extend the offer.
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleDispatchOffer}
                      disabled={sending}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition"
                    >
                      {sending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Send Offer to Candidate</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopySigningUrl}
                      title="Copy Candidate Portal Link"
                      className="p-2.5 bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-800 rounded-xl transition"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <form
                onSubmit={handleGenerateDraft}
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Candidate (Stage: Offer Extended)
                  </label>
                  {eligibleCandidates.length === 0 ? (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] leading-relaxed">
                      <AlertCircle className="w-4 h-4 text-amber-600 inline mr-1" />
                      No candidate is in the <strong>Offer Extended</strong>{" "}
                      stage. Advance a candidate on the Kanban board first.
                    </div>
                  ) : (
                    <select
                      value={selectedAppId}
                      onChange={(e) => setSelectedAppId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3 py-2.5 font-semibold outline-none focus:border-indigo-600"
                    >
                      {eligibleCandidates.map((cand) => (
                        <option
                          key={cand.applicationId}
                          value={cand.applicationId}
                        >
                          {cand.candidateName} — {cand.jobTitle}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Monthly Gross (NGN ₦)
                  </label>
                  <input
                    type="number"
                    min={200000}
                    step={50000}
                    value={monthlyGross}
                    onChange={(e) => setMonthlyGross(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3 py-2 font-mono font-bold outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />{" "}
                      USD FX Pegging Protection
                    </span>
                    <input
                      type="checkbox"
                      checked={fxPegging}
                      onChange={(e) => setFxPegging(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Calculated baseline:{" "}
                    <strong>${usdEquivalent.toLocaleString()} / mo</strong> @ ₦
                    {nafemRate}/$ NAFEM benchmark.
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Equity & Stock Options
                  </label>
                  <input
                    type="text"
                    value={equityOptions}
                    onChange={(e) => setEquityOptions(e.target.value)}
                    placeholder="e.g. 0.25% Stock Options (4-year vesting, 1-year cliff)"
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3 py-2 outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3 py-2 outline-none focus:border-indigo-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Offer Acceptance Window
                  </label>
                  <select
                    value={validityDays}
                    onChange={(e) => setValidityDays(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3 py-2 outline-none focus:border-indigo-600"
                  >
                    <option value={3}>3 Days (Fast-Track Expiry)</option>
                    <option value={7}>
                      7 Days (Standard Statutory Window)
                    </option>
                    <option value={14}>14 Days</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting || eligibleCandidates.length === 0}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating Draft Contract...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Generate Compliant
                        Offer Document (Draft)
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Live Offer Preview */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Nigerian Labour Act Compliant Offer Letter
                </h2>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <FileDown className="w-4 h-4" /> Download PDF
                </button>
              </div>

              <div
                id="printable-offer-document"
                className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 shadow-lg text-slate-800 font-sans space-y-6 text-xs leading-relaxed max-h-[82vh] overflow-y-auto"
              >
                <div className="text-center font-bold tracking-wider uppercase text-[11px] text-slate-500 border-b border-slate-200 pb-3">
                  Employment Offer Contract — Confidential
                </div>

                <div>
                  <p className="font-bold text-sm text-slate-900">
                    Dear {selectedCandidate?.candidateName || "Candidate"},
                  </p>
                  <p className="mt-2 text-slate-600">
                    We are delighted to offer you the position of{" "}
                    <strong className="text-slate-900">
                      {selectedCandidate?.jobTitle || "Software Engineer"}
                    </strong>{" "}
                    with our organization in Lagos, Nigeria, starting on{" "}
                    <strong className="font-mono text-slate-900">
                      {startDate}
                    </strong>
                    .
                  </p>
                </div>

                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2">
                  <h3 className="font-bold text-indigo-950 uppercase text-[11px]">
                    1. Compensation & Statutory Deductions
                  </h3>
                  <ul className="space-y-1.5 text-slate-700 pl-1">
                    <li>
                      • <strong>Monthly Gross Salary:</strong> ₦
                      {monthlyGross.toLocaleString()} NGN (₦
                      {annualGross.toLocaleString()} per annum)
                    </li>
                    {fxPegging && (
                      <li>
                        • <strong>FX Pegging Clause:</strong> Compensation is
                        pegged to USD ${usdEquivalent.toLocaleString()} with
                        quarterly adjustments against official NAFEM rates.
                      </li>
                    )}
                    <li>
                      • <strong>Statutory Pension:</strong> 8% employee
                      contribution (₦{employeePension.toLocaleString()}/mo), 10%
                      employer contribution (₦{employerPension.toLocaleString()}
                      /mo) remitted per Pension Reform Act 2014.
                    </li>
                    <li>
                      • <strong>PAYE Tax & NHF:</strong> Computed and deducted
                      in strict compliance with Lagos State Internal Revenue
                      Service (LIRS).
                    </li>
                    {equityOptions && (
                      <li>
                        • <strong>Equity:</strong> {equityOptions}
                      </li>
                    )}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-slate-900 uppercase text-[11px]">
                    2. Nigerian Labour Act Provisions (Cap L1, LFN 2004)
                  </h3>
                  <ul className="space-y-1.5 text-slate-600 pl-1">
                    <li>
                      • <strong>Probationary Period:</strong> 3 months with
                      formal review.
                    </li>
                    <li>
                      • <strong>Termination Notice:</strong> 1 month notice or
                      salary in lieu after confirmation.
                    </li>
                    <li>
                      • <strong>HMO Coverage:</strong> Comprehensive private
                      health insurance across top tier Nigerian hospitals.
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>
                    Please sign below via digital acceptance before the
                    expiration date.
                  </span>
                  <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {draftedOffer ? "Draft Approved" : "Draft Preview"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "ref_checks" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Dispatch Reference Check Questionnaire
                </h2>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Select Candidate
                  </label>
                  <select
                    value={selectedAppId}
                    onChange={(e) => setSelectedAppId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3 py-2.5 font-semibold outline-none focus:border-emerald-600"
                  >
                    {eligibleCandidates.map((cand) => (
                      <option
                        key={cand.applicationId}
                        value={cand.applicationId}
                      >
                        {cand.candidateName} ({cand.jobTitle})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Referee Name & Title
                  </label>
                  <input
                    type="text"
                    value={refereeName}
                    onChange={(e) => setRefereeName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Channel Delivery
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setChannelDelivery("whatsapp")}
                      className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                        channelDelivery === "whatsapp"
                          ? "border-emerald-500 bg-emerald-50/50 text-emerald-700"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      WhatsApp Instant Form
                    </button>

                    <button
                      type="button"
                      onClick={() => setChannelDelivery("email")}
                      className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                        channelDelivery === "email"
                          ? "border-indigo-500 bg-indigo-50/50 text-indigo-700"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5 text-indigo-600" />
                      Email Form
                    </button>
                  </div>
                </div>

                {channelDelivery === "whatsapp" ? (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      WhatsApp / Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={refereePhone}
                        onChange={(e) => setRefereePhone(e.target.value)}
                        placeholder="+234..."
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 font-mono text-slate-900 outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Referee Work Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={refereeEmail}
                        onChange={(e) => setRefereeEmail(e.target.value)}
                        placeholder="referee@company.com"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 font-mono text-slate-900 outline-none focus:border-indigo-600"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  {channelDelivery === "whatsapp" ? (
                    <a
                      href={`https://wa.me/${refereePhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                        `Hello ${refereeName}, HireIQ is conducting a brief statutory verification for ${selectedCandidate?.candidateName || "the candidate"}. Please review tenure & integrity: https://hireiq.ng/ref/verify/${selectedAppId || "token"}`,
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
                    >
                      <Send className="w-4 h-4" /> Send WhatsApp Reference
                      Questionnaire
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        alert(
                          `Reference verification questionnaire dispatched to ${refereeEmail}`,
                        )
                      }
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
                    >
                      <Mail className="w-4 h-4" /> Dispatch Email Verification
                      Form
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  AI Parsed Referee Verification Feed
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  Live Sync
                </span>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900">
                        Chinedu Okafor
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Referee: Tunde Kelani (Head of Core Banking, Kuda)
                      </p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      VERIFIED
                    </span>
                  </div>

                  <p className="text-slate-600 italic">
                    "Chinedu was one of our strongest backend engineers. He
                    built our settlement webhook queue that reduced duplicate
                    merchant debits. Reliable and humble."
                  </p>

                  <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Consistent •
                    Verified True
                  </div>
                </div>

                <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900">
                        Babatunde Adeleke
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Referee: Emeka Nwasu (Former Colleague)
                      </p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> INCONSISTENCY
                      FLAGGED
                    </span>
                  </div>

                  <p className="text-slate-600 italic">
                    "He worked on frontend landing pages for our app. He was not
                    the CTO and did not manage 50 engineers as claimed."
                  </p>

                  <div className="text-[11px] font-bold text-rose-700 bg-rose-100/60 p-2 rounded-lg border border-rose-200">
                    INCONSISTENCY FLAGGED: Title and team size inflated by 400%
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
