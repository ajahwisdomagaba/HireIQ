"use client";

import React from 'react';
import { 
  Sparkles, 
  Layers, 
  Video, 
  CheckSquare, 
  DollarSign, 
  FileText, 
  UserCheck, 
  Terminal, 
  Palette, 
  Plus, 
  UploadCloud,
  ChevronDown,
  Building2,
  Bell
} from 'lucide-react';
import { ViewMode } from '@/types';

interface HeaderProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  onOpenUploadModal: () => void;
  onOpenJobModal: () => void;
  companyName: string;
  onSelectCompany: (company: string) => void;
}

const COMPANIES = [
  'Paystack (Lagos HQ)',
  'Moniepoint Inc.',
  'Kuda Microfinance Bank',
  'Eden Life Nigeria',
  'PiggyVest Tech'
];

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onSelectView,
  onOpenUploadModal,
  onOpenJobModal,
  companyName,
  onSelectCompany,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const navItems: { id: ViewMode; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Overview', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'pipeline', label: 'ATS Pipeline', icon: <Layers className="w-4 h-4" /> },
    { id: 'live_interview', label: 'Live Interview Co-Pilot', icon: <Video className="w-4 h-4" />, badge: 'Realtime' },
    { id: 'assessments', label: 'Skill Assessments', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'salary_intelligence', label: 'Salary Intelligence (₦)', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'offers_references', label: 'Offers & Ref Checks', icon: <FileText className="w-4 h-4" /> },
    { id: 'candidate_portal', label: 'Candidate Experience', icon: <UserCheck className="w-4 h-4" />, badge: '5k Tier' },
    { id: 'mcp_server', label: 'MCP Server', icon: <Terminal className="w-4 h-4" /> },
    { id: 'figma_design_system', label: 'Figma Prototype', icon: <Palette className="w-4 h-4" />, badge: 'Design System' },
  ];

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      {/* Top utility bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-xs">
              <span className="font-display font-extrabold text-white text-base">IQ</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display font-bold text-lg tracking-tight text-slate-900">HireIQ</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60">NG</span>
              </div>
            </div>
          </div>

          <div className="hidden md:block h-4 w-px bg-slate-200" />

          {/* Company Workspace Switcher */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-md border border-slate-200 transition"
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>{companyName}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 mt-1 w-56 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
                <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Active Workspaces</div>
                {COMPANIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      onSelectCompany(c);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs transition flex items-center justify-between ${
                      c === companyName ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{c}</span>
                    {c === companyName && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Nigeria Context Indicator */}
          <div className="hidden lg:flex items-center space-x-1.5 text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Market calibrated: Lagos / Abuja / Remote NG</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={onOpenUploadModal}
            className="flex items-center space-x-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-lg shadow-2xs transition"
          >
            <UploadCloud className="w-3.5 h-3.5 text-slate-600" />
            <span>AI Screen CV</span>
          </button>

          <button
            onClick={onOpenJobModal}
            className="flex items-center space-x-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3.5 py-1.5 rounded-lg shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>Create Role</span>
          </button>
        </div>
      </div>

      {/* Main navigation scroll container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition relative ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className={isActive ? 'text-indigo-600' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold uppercase tracking-wider ${
                      item.id === 'figma_design_system'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : item.id === 'live_interview'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-indigo-600 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
