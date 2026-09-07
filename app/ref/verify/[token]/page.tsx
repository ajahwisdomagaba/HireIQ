'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Star,
  Building2,
  UserCheck,
  Loader2,
  Send,
} from 'lucide-react';

export default function PublicRefereeVerifyPage() {
  const params = useParams();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [candidateInfo, setCandidateInfo] = useState<{
    candidateName: string;
    jobTitle: string;
    companyName: string;
  } | null>(null);

  // Form State
  const [refereeName, setRefereeName] = useState('');
  const [refereeTitle, setRefereeTitle] = useState('');
  const [relationship, setRelationship] = useState('Direct Manager');
  const [confirmedTenure, setConfirmedTenure] = useState(true);
  const [tenureDiscrepancy, setTenureDiscrepancy] = useState('');
  const [technicalRating, setTechnicalRating] = useState(5);
  const [integrityRating, setIntegrityRating] = useState(5);
  const [comments, setComments] = useState('');

  useEffect(() => {
    async function loadTokenData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/v1/ref/verify/${token}`);
        if (!res.ok) throw new Error('Invalid or expired verification link.');
        const data = await res.json();
        setCandidateInfo(data);
      } catch (err: any) {
        setError(err.message || 'Unable to load verification request.');
      } finally {
        setLoading(false);
      }
    }
    if (token) loadTokenData();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/ref/verify/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refereeName,
          refereeTitle,
          relationship,
          confirmedTenure,
          tenureDiscrepancy: confirmedTenure ? null : tenureDiscrepancy,
          technicalRating,
          integrityRating,
          comments,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to submit verification.');
      }
    } catch {
      alert('Network error while submitting verification.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-400 font-mono text-xs gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
        <p>Loading HireIQ Secure Referee Portal...</p>
      </div>
    );
  }

  if (error || !candidateInfo) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
          <h2 className="text-white font-bold text-base">Invalid or Expired Link</h2>
          <p className="text-xs text-slate-400">
            {error || 'This referee verification link is invalid or has already been completed.'}
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#060b16] flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Verification Submitted</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Thank you, <strong>{refereeName}</strong>. Your feedback for{' '}
            <strong>{candidateInfo.candidateName}</strong> has been encrypted and recorded into the
            compliance audit ledger.
          </p>
          <div className="text-[10px] text-slate-400 font-mono border-t border-slate-100 pt-3">
            HireIQ Recruitment Intelligence • Verified Safe
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070d19] py-8 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-[11px] uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Statutory Employment Verification
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-2">
            Reference for {candidateInfo.candidateName}
          </h1>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            Applied for: <strong>{candidateInfo.jobTitle}</strong>
          </p>
          <div className="mt-4 p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 leading-relaxed">
            Takes approximately 2 minutes. Responses directly impact final offer clearance and background checks.
          </div>
        </div>

        {/* Questionnaire Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md space-y-5 text-xs text-slate-700"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                required
                value={refereeName}
                onChange={(e) => setRefereeName(e.target.value)}
                placeholder="e.g. Babatunde Lawal"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 outline-none focus:border-indigo-600 font-medium"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Your Official Designation
              </label>
              <input
                type="text"
                required
                value={refereeTitle}
                onChange={(e) => setRefereeTitle(e.target.value)}
                placeholder="e.g. VP Engineering, Kuda Bank"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 outline-none focus:border-indigo-600 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Professional Relationship to Candidate
            </label>
            <select
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 outline-none focus:border-indigo-600 font-medium"
            >
              <option value="Direct Manager">Direct Line Manager / Supervisor</option>
              <option value="Tech Lead">Technical Lead / Staff Engineer</option>
              <option value="Colleague">Peer / Direct Team Member</option>
              <option value="Client / Stakeholder">Client / Product Stakeholder</option>
            </select>
          </div>

          {/* Tenure Verification */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <label className="block text-[11px] font-bold text-slate-900">
              Tenure & Role Authenticity
            </label>
            <p className="text-[11px] text-slate-500">
              Can you confirm that {candidateInfo.candidateName} worked directly with your organization during the stated timeline?
            </p>
            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-xs">
                <input
                  type="radio"
                  name="tenure"
                  checked={confirmedTenure}
                  onChange={() => setConfirmedTenure(true)}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-emerald-700">Yes, accurate</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-bold text-xs">
                <input
                  type="radio"
                  name="tenure"
                  checked={!confirmedTenure}
                  onChange={() => setConfirmedTenure(false)}
                  className="w-4 h-4 text-rose-600 focus:ring-rose-500"
                />
                <span className="text-rose-700">Discrepancy / Inaccurate</span>
              </label>
            </div>

            {!confirmedTenure && (
              <div className="pt-2">
                <input
                  type="text"
                  required={!confirmedTenure}
                  value={tenureDiscrepancy}
                  onChange={(e) => setTenureDiscrepancy(e.target.value)}
                  placeholder="Specify actual dates or title held..."
                  className="w-full bg-white border border-rose-300 rounded-xl px-3 py-2 text-rose-900 outline-none focus:border-rose-500"
                />
              </div>
            )}
          </div>

          {/* Rating 1: Technical Execution */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Technical Mastery & Velocity (1 - 5)
              </label>
              <span className="font-mono font-bold text-indigo-600">{technicalRating} / 5</span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setTechnicalRating(star)}
                  className={`p-2 rounded-xl border flex-1 flex justify-center transition cursor-pointer ${
                    star <= technicalRating
                      ? 'bg-indigo-50 border-indigo-400 text-indigo-600'
                      : 'bg-slate-50 border-slate-200 text-slate-300'
                  }`}
                >
                  <Star className="w-5 h-5 fill-current" />
                </button>
              ))}
            </div>
          </div>

          {/* Rating 2: Integrity & Team Collaboration */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Integrity, Communication & Culture Fit (1 - 5)
              </label>
              <span className="font-mono font-bold text-emerald-600">{integrityRating} / 5</span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setIntegrityRating(star)}
                  className={`p-2 rounded-xl border flex-1 flex justify-center transition cursor-pointer ${
                    star <= integrityRating
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-600'
                      : 'bg-slate-50 border-slate-200 text-slate-300'
                  }`}
                >
                  <Star className="w-5 h-5 fill-current" />
                </button>
              ))}
            </div>
          </div>

          {/* Written Remarks */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Qualitative Feedback or Specific Achievements
            </label>
            <textarea
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="e.g. Reliable, architected resilient webhook queues, strong ownership during on-call rotations..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 outline-none focus:border-indigo-600"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                Submitting Encrypted Verification...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Submit Reference Verification
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}