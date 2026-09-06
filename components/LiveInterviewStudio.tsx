'use client';

import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  Sparkles, 
  Send, 
  Star, 
  MessageSquare, 
  Clock, 
  Check,
  Loader2
} from 'lucide-react';
import { Candidate } from '@/types';

interface LiveInterviewStudioProps {
  candidate: Candidate | null;
  candidates: Candidate[];
  interviewId?: string;
  jobTitle?: string;
  onSelectCandidate: (candidate: Candidate) => void;
  onSaveInterviewReport?: (candidateId: string, notes: string, rating: number) => void;
}

const SAMPLE_TRANSCRIPTS = [
  "At Kuda, I was responsible for our core payment reconciliation engine. When NIBSS switches experienced heavy timeout glitches at midnight, transactions would queue up. I introduced Redis-based distributed locks with SHA-256 idempotency tokens, which reduced duplicate merchant debits by 99.4%.",
  "I single-handedly built the entire mobile banking architecture for 15 million active users across West Africa in 6 months with zero downtime.",
  "We noticed that users in rural areas on 3G MTN connections had 40% checkout drop-offs because bundle payloads were over 5MB. I re-architected our React client into lightweight micro-frontends with offline service-worker caching, bringing the initial payload down to 340KB.",
  "I led a team of 20 senior software engineers and handled all regulatory compliance audits with CBN and NDIC personally."
];

export const LiveInterviewStudio: React.FC<LiveInterviewStudioProps> = ({
  candidate,
  candidates,
  interviewId,
  jobTitle = 'Senior Software Engineer',
  onSelectCandidate,
  onSaveInterviewReport,
}) => {
  const activeCandidate = candidate || candidates[0];

  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [isVideoOn, setIsVideoOn] = useState<boolean>(true);
  const [transcriptLogs, setTranscriptLogs] = useState<{ speaker: string; text: string; time: string }[]>([
    {
      speaker: 'Interviewer',
      text: 'Welcome! Can you tell us about a challenging distributed systems incident you resolved in production?',
      time: '14:02',
    },
    {
      speaker: activeCandidate?.name || 'Candidate',
      text: 'During high-traffic salary weeks, we experienced severe webhook retry storms and ledger synchronization delays...',
      time: '14:03',
    },
  ]);

  const [copilotSuggestions, setCopilotSuggestions] = useState<{
    id: string;
    question: string;
    rationale: string;
    urgency: 'high' | 'medium' | 'low';
    used?: boolean;
  }[]>([
    {
      id: 'co-1',
      question: 'How did you prevent race conditions when concurrent payment switch webhooks arrived within milliseconds?',
      rationale: 'Verifies atomic transaction control vs basic application memory.',
      urgency: 'high',
    },
  ]);

  const [interviewerNotes, setInterviewerNotes] = useState<string>('Strong response on distributed locking. Answered calmly with concrete metrics.');
  const [candidateRating, setCandidateRating] = useState<number>(4.8);
  const [customSpeechInput, setCustomSpeechInput] = useState<string>('');
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [interviewDuration, setInterviewDuration] = useState<number>(312);

  useEffect(() => {
    const timer = setInterval(() => {
      setInterviewDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Parses textual copilot feedback into structured cards
  const parseCopilotResponse = (text: string) => {
    const questions: { id: string; question: string; rationale: string; urgency: 'high' | 'medium' | 'low' }[] = [];
    
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    let currentQ = '';
    let currentCue = '';

    for (const line of lines) {
      if (line.includes('Probing Question')) {
        const cleaned = line.replace(/.*?Probing Question \d+:?\s*/i, '').replace(/\*\*/g, '').trim();
        if (cleaned) questions.push({ id: `co-${Date.now()}-${questions.length}`, question: cleaned, rationale: '', urgency: 'high' });
      } else if (line.includes('Verification Cue')) {
        currentCue = line.replace(/.*?Verification Cue:?\s*/i, '').replace(/\*\*/g, '').trim();
      }
    }

    if (questions.length > 0) {
      return questions.map(q => ({ ...q, rationale: currentCue || 'Evaluates depth of direct architectural ownership.' }));
    }

    // Fallback if model responds in freeform text
    return [{
      id: `co-${Date.now()}`,
      question: text.slice(0, 180),
      rationale: 'AI Generated verification cue',
      urgency: 'high' as const,
    }];
  };

  const handleSimulateCandidateSpeech = async (speechText?: string) => {
    const textToSend = speechText || customSpeechInput || SAMPLE_TRANSCRIPTS[Math.floor(Math.random() * SAMPLE_TRANSCRIPTS.length)];
    if (!textToSend.trim()) return;

    const newLog = {
      speaker: activeCandidate?.name || 'Candidate',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setTranscriptLogs((prev) => [...prev, newLog]);
    setCustomSpeechInput('');
    setIsLoadingAi(true);

    try {
      const res = await fetch('/api/ai/interview/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateClaim: textToSend,
          jobContext: jobTitle,
          interviewStage: 'TECHNICAL',
        }),
      });

      const data = await res.json();
      if (data.text) {
        const parsed = parseCopilotResponse(data.text);
        setCopilotSuggestions(parsed);
      }
    } catch (err) {
      console.error('Co-pilot stream error:', err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleUseQuestion = (id: string, questionText: string) => {
    setCopilotSuggestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, used: true } : q))
    );
    setTranscriptLogs((prev) => [
      ...prev,
      {
        speaker: 'Interviewer (via Co-Pilot)',
        text: questionText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleCompleteInterview = async () => {
    setIsSaving(true);
    const fullTranscript = transcriptLogs.map(l => `[${l.time}] ${l.speaker}: ${l.text}`).join('\n');

    try {
      if (interviewId) {
        const res = await fetch(`/api/v1/interviews/${interviewId}/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript: fullTranscript,
            recruiterNotes: `${interviewerNotes}\nCandidate Rating: ${candidateRating}/5.0`,
          }),
        });

        if (!res.ok) {
          throw new Error('Failed to complete interview via API');
        }
      }

      if (onSaveInterviewReport && activeCandidate) {
        onSaveInterviewReport(activeCandidate.id, interviewerNotes, candidateRating);
      }

      alert('Interview synthesis complete. Candidate report and knowledge embeddings updated.');
    } catch (err: any) {
      console.error('Error completing interview:', err);
      alert(err.message || 'Error saving interview report');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Header Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900 font-display">Live AI Interview Studio</h2>
              <span className="flex items-center space-x-1 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                <span>Active Stream</span>
              </span>
            </div>
            <p className="text-xs text-slate-500">Real-time claim verification & probing engine</p>
          </div>
        </div>

        {/* Candidate Switcher & Timer */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-indigo-700 font-semibold">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>{formatTime(interviewDuration)}</span>
          </div>

          <select
            value={activeCandidate?.id}
            onChange={(e) => {
              const c = candidates.find((cand) => cand.id === e.target.value);
              if (c) onSelectCandidate(c);
            }}
            className="bg-slate-50 text-slate-800 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white"
          >
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                Candidate: {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Video Stream + AI Co-Pilot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Video Feeds & Live Speech Feed */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-200 rounded-2xl p-3 relative aspect-video flex items-center justify-center overflow-hidden group shadow-xs">
            {isVideoOn ? (
              <div className="relative w-full h-full rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center">
                <img
                  src={activeCandidate?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80'}
                  alt={activeCandidate?.name}
                  className="w-full h-full object-cover filter brightness-95"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-xs font-semibold text-white flex items-center space-x-1.5 border border-slate-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>{activeCandidate?.name}</span>
                </div>
                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-[11px] text-slate-300 font-mono border border-slate-700">
                  Encrypted Live WebRTC Channel
                </div>
              </div>
            ) : (
              <div className="w-full h-full rounded-xl bg-slate-900 flex flex-col items-center justify-center text-slate-400">
                <VideoOff className="w-10 h-10 mb-2" />
                <span className="text-xs">Camera Feed Disabled</span>
              </div>
            )}

            {/* In-Call Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700 shadow-xl">
              <button
                onClick={() => setIsMicOn(!isMicOn)}
                className={`p-2.5 rounded-lg transition ${
                  isMicOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white'
                }`}
              >
                {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-2.5 rounded-lg transition ${
                  isVideoOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white'
                }`}
              >
                {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>

              <div className="h-4 w-px bg-slate-700 mx-1" />

              <button
                onClick={handleCompleteInterview}
                disabled={isSaving}
                className="flex items-center space-x-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg transition shadow-xs disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 text-white" />}
                <span>{isSaving ? 'Synthesizing...' : 'Complete & Report'}</span>
              </button>
            </div>
          </div>

          {/* Transcript Feed */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Live Speech-to-Text Transcript</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Real-time STT</span>
            </div>

            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {transcriptLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                    log.speaker.includes('Interviewer')
                      ? 'bg-slate-50 border border-slate-200 text-slate-700'
                      : 'bg-indigo-50/70 border border-indigo-100 text-indigo-950'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[11px] text-slate-900">{log.speaker}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{log.time}</span>
                  </div>
                  <p>{log.text}</p>
                </div>
              ))}
            </div>

            {/* Candidate Speech Simulation Input */}
            <div className="pt-2 border-t border-slate-100 flex items-center space-x-2">
              <input
                type="text"
                placeholder="Simulate candidate speech (e.g. 'I refactored our payment ledger...')"
                value={customSpeechInput}
                onChange={(e) => setCustomSpeechInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSimulateCandidateSpeech()}
                className="flex-1 bg-slate-50 text-slate-800 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white placeholder:text-slate-400"
              />
              <button
                onClick={() => handleSimulateCandidateSpeech()}
                disabled={isLoadingAi}
                className="flex items-center space-x-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2 rounded-lg border border-slate-200 transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 text-slate-600" />
                <span>Simulate Speech</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Co-Pilot HUD & Probes */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                <h3 className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                  AI Co-Pilot Real-Time Probes
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-semibold uppercase">
                Active Listening
              </span>
            </div>

            <p className="text-xs text-slate-500">
              AI evaluates candidate claims against architectural standards and streams deep follow-up questions.
            </p>

            {isLoadingAi ? (
              <div className="p-6 text-center text-xs text-slate-500 space-y-2">
                <Sparkles className="w-5 h-5 text-indigo-600 animate-spin mx-auto" />
                <span>Generating technical verification probes...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {copilotSuggestions.map((sug) => (
                  <div
                    key={sug.id}
                    className={`p-3 rounded-xl border transition space-y-2 ${
                      sug.used
                        ? 'bg-slate-50 border-slate-200 opacity-60'
                        : 'bg-white border-indigo-200 hover:border-indigo-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold uppercase tracking-wider text-indigo-600 flex items-center space-x-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Recommended Probing Question</span>
                      </span>
                      <span className="px-1.5 py-0.2 rounded font-mono uppercase bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                        {sug.urgency} impact
                      </span>
                    </div>

                    <p className="text-xs text-slate-900 font-medium leading-relaxed">
                      "{sug.question}"
                    </p>

                    <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 line-clamp-1">{sug.rationale}</span>
                      <button
                        onClick={() => handleUseQuestion(sug.id, sug.question)}
                        disabled={sug.used}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded transition shrink-0 ml-2 ${
                          sug.used
                            ? 'bg-slate-100 text-slate-400'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white font-semibold'
                        }`}
                      >
                        {sug.used ? 'Asked' : 'Ask This Question →'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recruiter Scorecard & Notes */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Live Interview Notes</h3>
            
            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-700">Interview Rating:</span>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setCandidateRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= Math.round(candidateRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-mono font-bold text-amber-500 ml-1">{candidateRating.toFixed(1)}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500">Recruiter Impressions</label>
              <textarea
                rows={3}
                value={interviewerNotes}
                onChange={(e) => setInterviewerNotes(e.target.value)}
                placeholder="Take notes during the session..."
                className="w-full bg-slate-50 text-slate-800 text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white resize-none font-sans placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};