"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Search,
  Filter,
  Building2,
  RotateCw,
  Copy,
  Check,
  Calendar,
  XCircle,
  Plus,
  FileDown,
} from "lucide-react";

interface OfferItem {
  id: string;
  applicationId: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  baseSalaryNGN: number;
  monthlyGrossNGN: number;
  monthlyPensionNGN: number;
  currency: string;
  status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED";
  signedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  offerDocumentUrl: string | null;
}

export default function RecruiterOffersPage() {
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/offers");
      if (res.ok) {
        const data = await res.json();
        setOffers(data.offers || []);
      }
    } catch (error) {
      console.error("Failed to load offers", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleCopyLink = (offerId: string) => {
    const fullUrl = `${window.location.origin}/candidate/offers/${offerId}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(offerId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const metrics = useMemo(() => {
    const total = offers.length;
    const accepted = offers.filter((o) => o.status === "ACCEPTED").length;
    const pending = offers.filter((o) => o.status === "SENT").length;
    const expired = offers.filter((o) => o.status === "EXPIRED").length;
    const acceptanceRate = total > 0 ? Math.round((accepted / total) * 100) : 0;

    return { total, accepted, pending, expired, acceptanceRate };
  }, [offers]);

  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      const matchesQuery =
        offer.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" ? true : offer.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [offers, searchQuery, statusFilter]);

  const getStatusBadge = (status: OfferItem["status"]) => {
    switch (status) {
      case "ACCEPTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Accepted & Signed
          </span>
        );
      case "SENT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" /> Pending Execution
          </span>
        );
      case "EXPIRED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/20">
            <AlertCircle className="w-3.5 h-3.5" /> Expired
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <XCircle className="w-3.5 h-3.5" /> Declined
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
            <FileText className="w-3.5 h-3.5" /> Draft
          </span>
        );
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* High-Contrast Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <FileText className="w-6 h-6" />
            </div>
            Statutory Offers & Contracts
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Real-time status tracking, digital signatures, and Nigerian Labour
            Act (Cap L1, LFN 2004) statutory terms.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/offers/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition shadow-lg"
          >
            <Plus className="w-4 h-4" /> Issue New Offer
          </Link>

          <button
            onClick={fetchOffers}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl transition shadow-xs"
          >
            <RotateCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Offers Issued
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {metrics.total}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Across all open pipelines
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Accepted & Executed
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1 flex items-baseline gap-2">
            <span>{metrics.accepted}</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {metrics.acceptanceRate}% Rate
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Legally binding signatures
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Pending Execution
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {metrics.pending}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Awaiting candidate action
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Expired Offers
          </div>
          <div className="text-2xl font-black text-rose-600 mt-1">
            {metrics.expired}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Past validity window
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate, role, or ID..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Offers</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="SENT">Pending Execution</option>
            <option value="EXPIRED">Expired</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>
      </div>

      {/* Offers Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Candidate & Role</th>
                <th className="py-3.5 px-4">Gross Compensation</th>
                <th className="py-3.5 px-4">Pension (PRA 2014)</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Execution / Expiration</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredOffers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No offers matching criteria found.
                  </td>
                </tr>
              ) : (
                filteredOffers.map((offer) => (
                  <tr
                    key={offer.id}
                    className="hover:bg-slate-50/60 transition"
                  >
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900">
                        {offer.candidateName}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-slate-400" />{" "}
                        {offer.jobTitle}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-1">
                        Ref: {offer.id.slice(0, 14)}...
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono">
                      <div className="font-bold text-emerald-600">
                        ₦{offer.monthlyGrossNGN.toLocaleString()}/mo
                      </div>
                      <div className="text-[10px] text-slate-400">
                        ₦{offer.baseSalaryNGN.toLocaleString()} p.a.
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono">
                      <div className="font-bold text-slate-800">
                        ₦{offer.monthlyPensionNGN.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        8% to RSA
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      {getStatusBadge(offer.status)}
                    </td>

                    <td className="py-4 px-4 text-[11px] text-slate-500">
                      {offer.signedAt ? (
                        <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>
                            Signed:{" "}
                            {new Date(offer.signedAt).toLocaleDateString()}
                          </span>
                        </div>
                      ) : offer.expiresAt ? (
                        <div className="flex items-center gap-1 text-amber-600 font-semibold">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            Expires:{" "}
                            {new Date(offer.expiresAt).toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        <div className="text-slate-400">Valid for 7 Days</div>
                      )}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Only show the download button for executed/accepted offers, or if document exists */}
                        {(offer.status === "ACCEPTED" ||
                          offer.offerDocumentUrl) && (
                          <a
                            href={`/api/v1/offers/${offer.id}/pdf`}
                            download={`Offer_${offer.candidateName.replace(/\s+/g, "_")}.pdf`}
                            title="Download Sealed Executed Contract"
                            className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {/* Copy Candidate Signing URL */}
                        <button
                          type="button"
                          onClick={() => handleCopyLink(offer.id)}
                          title="Copy Candidate Portal Signing URL"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                        >
                          {copiedId === offer.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Open Live Portal */}
                        <Link
                          href={`/candidate/offers/${offer.id}`}
                          target="_blank"
                          title="Open Live Candidate Portal"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
