'use client';

import React, { useState } from 'react';
import {
  Share2,
  Send,
  Linkedin,
  Rss,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  X,
  AlertCircle,
} from 'lucide-react';

interface MultiChannelBroadcastModalProps {
  job: {
    id: string;
    title: string;
    companyName: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function MultiChannelBroadcastModal({
  job,
  isOpen,
  onClose,
}: MultiChannelBroadcastModalProps) {
  const [broadcasting, setBroadcasting] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState<string | null>(null);
  const [copiedFeed, setCopiedFeed] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const [broadcastData, setBroadcastData] = useState<{
    telegramSuccess?: boolean;
    linkedinShareUrl?: string;
    linkedinText?: string;
    jobbermanUrl?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleBroadcast = async () => {
    setBroadcasting(true);
    setTelegramStatus(null);
    try {
      const res = await fetch(`/api/v1/jobs/${job.id}/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channels: ['telegram', 'linkedin'] }),
      });

      const data = await res.json();
      if (res.ok) {
        setBroadcastData({
          telegramSuccess: data.telegram?.success,
          linkedinShareUrl: data.linkedin?.shareUrl,
          linkedinText: data.linkedin?.textPayload,
          jobbermanUrl: data.jobbermanFeedUrl,
        });

        setTelegramStatus(
          data.telegram?.success
            ? 'Broadcasted live to Telegram Job Channel!'
            : `Telegram notice: ${data.telegram?.error || 'Config missing'}`
        );
      } else {
        alert(data.error || 'Broadcasting failed');
      }
    } catch {
      alert('Network error broadcasting job');
    } finally {
      setBroadcasting(false);
    }
  };

  const copyJobbermanUrl = () => {
    const url = `${window.location.origin}/api/v1/jobs/feed/jobberman`;
    navigator.clipboard.writeText(url);
    setCopiedFeed(true);
    setTimeout(() => setCopiedFeed(false), 2000);
  };

  const copyLinkedInText = () => {
    if (!broadcastData?.linkedinText) return;
    navigator.clipboard.writeText(broadcastData.linkedinText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 text-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Multi-Channel Job Broadcast</h3>
              <p className="text-[11px] text-slate-500">
                Syndicate <strong>{job.title}</strong> across external talent channels.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Channel Cards */}
        <div className="space-y-3 text-xs">
          {/* Channel 1: Telegram */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-50 text-sky-600 rounded-xl border border-sky-200">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Telegram Jobs Channel</h4>
                <p className="text-[11px] text-slate-500">
                  Direct Markdown post with inline 1-click apply button.
                </p>
              </div>
            </div>
            {broadcastData?.telegramSuccess ? (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Live on Channel
              </span>
            ) : (
              <span className="text-[10px] font-mono text-slate-400">Ready</span>
            )}
          </div>

          {/* Channel 2: LinkedIn Share */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
                <Linkedin className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">LinkedIn Talent Share</h4>
                <p className="text-[11px] text-slate-500">
                  Formatted post with verified HireIQ application link.
                </p>
              </div>
            </div>
            {broadcastData?.linkedinShareUrl ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={copyLinkedInText}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center gap-1"
                >
                  {copiedText ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  Copy Post
                </button>
                <a
                  href={broadcastData.linkedinShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" /> Share
                </a>
              </div>
            ) : (
              <span className="text-[10px] font-mono text-slate-400">Ready</span>
            )}
          </div>

          {/* Channel 3: Jobberman XML Feed */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-200">
                <Rss className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Jobberman / Aggregator Feed</h4>
                <p className="text-[11px] text-slate-500">
                  Standard XML source feed auto-harvested by job crawlers.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={copyJobbermanUrl}
              className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center gap-1"
            >
              {copiedFeed ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              Copy XML Feed URL
            </button>
          </div>
        </div>

        {telegramStatus && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{telegramStatus}</span>
          </div>
        )}

        {/* Action Trigger */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleBroadcast}
            disabled={broadcasting}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition"
          >
            {broadcasting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Broadcasting Channels...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Trigger Live Broadcast
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}