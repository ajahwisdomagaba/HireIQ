'use client';

import { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  FileText, 
  Building2, 
  Target, 
  Loader2, 
  ShieldCheck,
  BrainCircuit
} from 'lucide-react';

export default function HiringIntelligenceMemoryPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || query.length < 3) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/v1/intelligence/search?query=${encodeURIComponent(query)}&threshold=0.01&limit=8`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.matches || []);
      }
    } catch (err) {
      console.error('Semantic search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 text-slate-200">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5 tracking-tight">
          <BrainCircuit className="h-6 w-6 text-emerald-400" />
          Hiring Memory & Semantic Retrieval
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Surface historical candidates, past interview answers, and domain evidence using vector cosine similarity.
        </p>
      </div>

      {/* Semantic Search Input Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. 'Handled distributed transaction locks under high concurrency without Redis downtime'..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-emerald-500 transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={loading || query.length < 3}
          className="px-5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 transition-all"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Query Memory
        </button>
      </form>

      {/* Results Container */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-emerald-400" />
            Scanning high-dimensional vector space across company records...
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((match) => (
              <div
                key={match.chunkId}
                className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 hover:border-slate-700 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-emerald-400" />
                      {match.sourceTitle}
                    </h3>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      {match.category.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                    {(match.similarity * 100).toFixed(1)}% Match
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800/80 line-clamp-4">
                  "{match.content}"
                </p>
              </div>
            ))}
          </div>
        ) : hasSearched ? (
          <div className="p-12 bg-slate-900 border border-slate-800 rounded-2xl text-center text-xs text-slate-500 space-y-2">
            <Target className="h-8 w-8 mx-auto opacity-30 text-slate-500" />
            <p>No historical candidate records or interview excerpts matched this query above the similarity threshold.</p>
          </div>
        ) : (
          <div className="p-12 border border-dashed border-slate-800 rounded-2xl text-center text-xs text-slate-600">
            Enter natural language engineering criteria to search across all indexed resumes and live interview sessions.
          </div>
        )}
      </div>
    </div>
  );
}