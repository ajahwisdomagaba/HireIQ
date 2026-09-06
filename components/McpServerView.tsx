'use client';

import React, { useState } from 'react';
import { 
  Terminal, 
  Code, 
  Sparkles, 
  Play, 
  CheckCircle2, 
  Copy, 
  Check, 
  Server,
  Layers,
  ArrowRight
} from 'lucide-react';

const MCP_TOOLS = [
  {
    name: 'hireiq_screen_cv',
    description: 'Screen a Nigerian candidate CV against job requirements with local context scoring.',
    parameters: {
      cvText: 'string',
      jobTitle: 'string',
      requirements: 'string[]',
    },
    sampleInput: {
      cvText: 'Olumide Bakare, 4.5 yrs Node.js at Interswitch handling ISO 8583 card switches and Redis idempotency locks.',
      jobTitle: 'Senior Backend Engineer',
      requirements: ['Node.js', 'Fintech', 'Redis'],
    },
  },
  {
    name: 'hireiq_detect_cv_inflation',
    description: 'Scan Nigerian candidate claims for unverified buzzword inflation, fake CTO titles, or unrealistic numbers.',
    parameters: {
      cvText: 'string',
    },
    sampleInput: {
      cvText: 'Graduated in 2023. Led 50 global engineers as CTO and processed ₦50 Billion weekly with proprietary AI.',
    },
  },
  {
    name: 'hireiq_get_salary_benchmark',
    description: 'Query real-time verified Nigerian tech compensation percentiles (P25, P50, P75, P90 in NGN ₦).',
    parameters: {
      role: 'string',
      location: 'string',
      experienceYears: 'number',
    },
    sampleInput: {
      role: 'Senior Backend Engineer',
      location: 'Lagos',
      experienceYears: 5,
    },
  },
  {
    name: 'hireiq_generate_assessment',
    description: 'Generate practical Nigerian production coding challenge (e.g. Paystack webhook verification, NIBSS reconciliation).',
    parameters: {
      roleTitle: 'string',
      seniority: 'string',
      domain: 'string',
    },
    sampleInput: {
      roleTitle: 'Lead DevOps Engineer',
      seniority: 'Senior',
      domain: 'Fintech Cloud & AWS Lagos Local Zone',
    },
  },
];

export const McpServerView: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<typeof MCP_TOOLS[0]>(MCP_TOOLS[0]);
  const [inputJson, setInputJson] = useState<string>(JSON.stringify(MCP_TOOLS[0].sampleInput, null, 2));
  const [outputJson, setOutputJson] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleSelectTool = (tool: typeof MCP_TOOLS[0]) => {
    setSelectedTool(tool);
    setInputJson(JSON.stringify(tool.sampleInput, null, 2));
    setOutputJson('');
  };

  const handleExecuteMcpTool = async () => {
    setIsRunning(true);
    try {
      let parsed = {};
      try {
        parsed = JSON.parse(inputJson);
      } catch {
        parsed = {};
      }

      const res = await fetch('/api/mcp/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolName: selectedTool.name,
          arguments: parsed,
        }),
      });

      const data = await res.json();
      setOutputJson(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setOutputJson(JSON.stringify({ error: err.message || 'Execution error' }, null, 2));
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(`{
  "mcpServers": {
    "hireiq-ng": {
      "command": "node",
      "args": ["dist/server.cjs"],
      "env": {
        "GEMINI_API_KEY": "YOUR_GEMINI_KEY"
      }
    }
  }
}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 relative overflow-hidden shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                Model Context Protocol (MCP)
              </span>
              <span className="text-xs text-slate-500">JSON-RPC 2.0 Standard</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 font-display">
              HireIQ Model Context Protocol (MCP) Server
            </h1>
            <p className="text-xs text-slate-600 max-w-2xl mt-1 leading-relaxed">
              Integrate Nigerian recruitment intelligence directly into Claude Desktop, Cursor, and external AI agents via our standard MCP tools.
            </p>
          </div>

          <button
            onClick={handleCopyConfig}
            className="flex items-center space-x-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 px-3.5 py-2 rounded-lg transition shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-indigo-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Config!' : 'Copy Claude MCP Config'}</span>
          </button>
        </div>
      </div>

      {/* Main MCP Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 Cols): Available MCP Tools List */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
            <Server className="w-4 h-4 text-indigo-600" />
            <span>Exposed MCP Tools</span>
          </h3>

          <div className="space-y-2">
            {MCP_TOOLS.map((tool) => (
              <button
                key={tool.name}
                onClick={() => handleSelectTool(tool)}
                className={`w-full text-left p-3 rounded-xl border transition text-xs space-y-1 ${
                  tool.name === selectedTool.name
                    ? 'bg-indigo-50/60 border-indigo-300 text-slate-900 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                <div className="font-mono font-bold text-indigo-700 truncate">{tool.name}</div>
                <p className="text-[11px] text-slate-500 line-clamp-2">{tool.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column (8 Cols): Interactive JSON-RPC Runner */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono text-indigo-600 font-bold uppercase">Active Tool:</span>
                <h3 className="text-sm font-bold text-slate-900 font-mono">{selectedTool.name}</h3>
              </div>

              <button
                onClick={handleExecuteMcpTool}
                disabled={isRunning}
                className="flex items-center space-x-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{isRunning ? 'Executing MCP Tool...' : 'Execute JSON-RPC'}</span>
              </button>
            </div>

            {/* Input Arguments Editor */}
            <div className="space-y-1">
              <label className="text-[11px] uppercase font-bold text-slate-500 block font-mono">
                Request Arguments (JSON)
              </label>
              <textarea
                rows={7}
                value={inputJson}
                onChange={(e) => setInputJson(e.target.value)}
                className="w-full bg-slate-900 text-emerald-300 text-xs font-mono p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed shadow-inner"
                spellCheck={false}
              />
            </div>

            {/* Output Result Console */}
            <div className="space-y-1">
              <label className="text-[11px] uppercase font-bold text-slate-500 block font-mono">
                JSON-RPC 2.0 Response Result
              </label>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 min-h-40 max-h-70 overflow-y-auto text-xs font-mono text-emerald-300 whitespace-pre-wrap leading-relaxed shadow-inner">
                {outputJson || <span className="text-slate-500 italic">// Click "Execute JSON-RPC" to invoke tool...</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
