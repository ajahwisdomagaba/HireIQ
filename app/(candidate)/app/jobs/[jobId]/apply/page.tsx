'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Briefcase, 
  MapPin, 
  Building2, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  FileText
} from 'lucide-react';

export default function CandidateJobApplyPage() {
  const params = useParams();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    headline: '',
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    async function fetchJob() {
      try {
        const res = await fetch(`/api/v1/jobs/${params.jobId}/public`);
        if (!res.ok) throw new Error('Job posting unavailable');
        const data = await res.json();
        setJob(data.job);
      } catch (err: any) {
        setError(err.message || 'Failed to load job details');
      } finally {
        setLoading(false);
      }
    }
    fetchJob();
  }, [params.jobId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeFile) {
      setError('Please upload your resume (PDF/DOCX).');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('name', form.name);
      data.append('email', form.email);
      data.append('phoneNumber', form.phoneNumber);
      data.append('headline', form.headline);
      data.append('resume', resumeFile);

      const res = await fetch(`/api/v1/jobs/${params.jobId}/apply`, {
        method: 'POST',
        body: data,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to submit application');

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading job opportunity...
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Application Received</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your application for <strong className="text-slate-200">{job?.title}</strong> at <strong className="text-slate-200">{job?.company.name}</strong> has been submitted. Our hiring team will review your qualifications shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Job Header */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">{job?.title}</h1>
              <p className="text-sm text-slate-400 flex items-center gap-2 mt-1">
                <Building2 className="h-4 w-4 text-emerald-400" /> {job?.company.name} • {job?.department?.name || 'General'}
              </p>
            </div>
            <span className="text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-full font-medium">
              {job?.employmentType}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-slate-500" /> {job?.location}
            </div>
            <div className="flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-slate-500" /> {job?.experienceLevel} Level
            </div>
          </div>
        </div>

        {/* Application Form */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-semibold text-white">Submit Your Application</h2>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-rose-400 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Babatunde Adeleke"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Email Address *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="babatunde@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  placeholder="+234 801 234 5678"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Professional Headline</label>
                <input
                  type="text"
                  value={form.headline}
                  onChange={(e) => setForm({ ...form, headline: e.target.value })}
                  placeholder="Senior Backend Engineer | Node.js | Microservices"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Resume Upload */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">Resume / CV (PDF, DOCX) *</label>
              <div className="relative border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-xl p-6 text-center cursor-pointer bg-slate-950">
                <input
                  type="file"
                  required
                  accept=".pdf,.docx,.doc"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center space-y-2 text-xs text-slate-400">
                  <UploadCloud className="h-8 w-8 text-slate-500 mb-1" />
                  {resumeFile ? (
                    <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                      <FileText className="h-4 w-4" /> {resumeFile.name} ({(resumeFile.size / 1024).toFixed(0)} KB)
                    </span>
                  ) : (
                    <>
                      <p className="font-semibold text-slate-200">Click to upload or drag and drop</p>
                      <p className="text-slate-500">PDF or Word document up to 10MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {submitting ? 'Submitting Application...' : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}