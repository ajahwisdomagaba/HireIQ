'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  Sparkles, 
  FileText, 
  Loader2,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function LiveInterviewStudioPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = params?.interviewId;
  const interviewId = Array.isArray(rawId) ? rawId[0] : (rawId as string);

  const [interview, setInterview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [candidateClaim, setCandidateClaim] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [interviewNotes, setInterviewNotes] = useState('');
  const [isEnding, setIsEnding] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadInterview() {
      if (!interviewId) return;
      try {
        const res = await fetch('/api/v1/interviews');
        if (res.ok) {
          const data = await res.json();
          const match = data.interviews?.find((i: any) => i.id === interviewId);
          if (isMounted && match) {
            setInterview(match);
          }
        }
      } catch (err) {
        console.error('Failed to load live interview data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadInterview();

    return () => {
      isMounted = false;
    };
  }, [interviewId]);

  const triggerCoPilotAnalysis = async (text?: string) => {
    const textToSend = text || candidateClaim;
    if (!textToSend.trim()) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/ai/interview/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateClaim: textToSend,
          jobContext: interview?.application?.job?.title || 'Senior Backend Engineer (High-Throughput Fintech)',
          interviewStage: 'TECHNICAL',
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to get co-pilot guidance');

      const cleanContent = typeof data.text === 'string' ? data.text : JSON.stringify(data);

      setAiSuggestions((prev) => [cleanContent, ...prev]);
      setCandidateClaim('');
    } catch (err) {
      console.error('Co-Pilot error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleEndInterview = async () => {
    setIsEnding(true);
    try {
      const transcript = aiSuggestions.join('\n\n') || 'Candidate completed live architecture discussion.';
      const res = await fetch(`/api/v1/interviews/${interviewId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          recruiterNotes: interviewNotes,
        }),
      });

      if (res.ok) {
        router.push('/dashboard/interviews');
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || 'Failed to finalize interview');
      }
    } catch (err) {
      console.error('Failed to finalize interview:', err);
      alert('Network error finalizing session');
    } finally {
      setIsEnding(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center font-mono text-slate-400 space-y-3">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
        <p className="text-xs">Mounting Live Co-Pilot HUD...</p>
      </div>
    );
  }

  const candidateName = interview?.application?.candidateProfile?.user?.name || 'Applicant';
  const jobTitle = interview?.application?.job?.title || 'Technical Requisition';

  return (
    <div className="p-6 h-[calc(100vh-4rem)] flex flex-col gap-4 text-slate-200">
      {/* Top Session Control Bar */}
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/dashboard/interviews/${interviewId}`)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="h-3 w-3 rounded-full bg-rose-500 animate-pulse" />
          <div>
            <h1 className="font-semibold text-white text-sm">
              Live Room: {candidateName}
            </h1>
            <p className="text-[11px] text-slate-400">{jobTitle}</p>
          </div>
          <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700 font-mono">
            TECHNICAL ROUND
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={() => setIsMicOn(!isMicOn)} 
            className={`p-2 rounded-lg border transition ${
              isMicOn ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-rose-500/20 border-rose-500/40 text-rose-400'
            }`}
          >
            {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </button>
          <button 
            type="button"
            onClick={() => setIsVideoOn(!isVideoOn)} 
            className={`p-2 rounded-lg border transition ${
              isVideoOn ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-rose-500/20 border-rose-500/40 text-rose-400'
            }`}
          >
            {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          </button>
          <button 
            type="button"
            onClick={handleEndInterview}
            disabled={isEnding}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold ml-2 flex items-center gap-1.5 transition shadow-lg shadow-rose-950"
          >
            {isEnding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            {isEnding ? 'Synthesizing...' : 'End & Generate Report'}
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-12 gap-4 flex-1 min-h-0">
        {/* Left: Video Area & Real-Time Claim Verification */}
        <div className="col-span-8 flex flex-col gap-4">
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl relative overflow-hidden flex items-center justify-center">
            {isVideoOn ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80"
                  alt={candidateName}
                  className="w-full h-full object-cover filter brightness-95"
                />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-xs font-semibold text-white border border-slate-700 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  {candidateName} (Lagos, NG)
                </div>
                <div className="absolute bottom-4 left-4 px-3 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-[11px] font-mono text-slate-300 border border-slate-700">
                  Daily.co WebRTC Stream · 1080p
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-600 space-y-2">
                <VideoOff className="h-10 w-10 mx-auto opacity-40 text-slate-500" />
                <p className="text-sm font-medium text-slate-400">Camera Feed Muted</p>
              </div>
            )}
          </div>

          {/* Real-Time Claim Tester Bar */}
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex gap-2">
            <input
              type="text"
              value={candidateClaim}
              onChange={(e) => setCandidateClaim(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && triggerCoPilotAnalysis()}
              placeholder="Candidate statement to verify (e.g. 'I managed NIBSS switches with zero data loss using Redis locks')..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-emerald-500 outline-none"
            />
            <button
              type="button"
              onClick={() => triggerCoPilotAnalysis()}
              disabled={isAnalyzing || !candidateClaim.trim()}
              className="px-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition"
            >
              {isAnalyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              Analyze Claim
            </button>
          </div>
        </div>

        {/* Right: AI Co-Pilot Feed & Scorecard Notes */}
        <div className="col-span-4 flex flex-col gap-4 overflow-hidden">
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-800">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Live AI Co-Pilot Probes
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {aiSuggestions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-600 p-4">
                  <Sparkles className="h-8 w-8 mb-2 opacity-30 text-emerald-400" />
                  <p className="text-xs">
                    Type or stream candidate claims on the left to generate real-time probing questions and verification signals.
                  </p>
                </div>
              ) : (
                aiSuggestions.map((item, index) => (
                  <div 
                    key={index} 
                    className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 shadow-md space-y-2 leading-relaxed"
                  >
                    <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px] pb-1 border-b border-slate-900">
                      <Sparkles className="h-3 w-3" /> Signal Probe #{aiSuggestions.length - index}
                    </div>
                    <div className="whitespace-pre-line text-slate-300 font-sans">
                      {item}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recruiter Notes Scratchpad */}
          <div className="h-44 bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-400">
              <FileText className="h-3.5 w-3.5 text-slate-400" /> Recruiter Live Notes
            </div>
            <textarea
              value={interviewNotes}
              onChange={(e) => setInterviewNotes(e.target.value)}
              placeholder="Candidate demonstrated deep postgres knowledge, but stumbled on distributed cache invalidation..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 resize-none outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}