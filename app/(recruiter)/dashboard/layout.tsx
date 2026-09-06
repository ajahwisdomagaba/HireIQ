'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BrainCircuit,
  Briefcase, 
  Users, 
  Video, 
  Code2, 
  DollarSign, 
  FileCheck2, 
  Sparkles,
  Bell,
  Search
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard/overview', icon: LayoutDashboard },
  { label: 'Jobs & Pipeline', href: '/dashboard/jobs', icon: Briefcase },
  { label: 'Candidates', href: '/dashboard/candidates', icon: Users },
  { label: 'Live Interviews', href: '/dashboard/interviews', icon: Video },
  { label: 'Assessments', href: '/dashboard/assessments', icon: Code2 },
  { label: 'Salary Intel', href: '/dashboard/salary-intelligence', icon: DollarSign },
  { label: 'Offers & Refs', href: '/dashboard/offers', icon: FileCheck2 },
  { label: 'Hiring Memory', href: '/dashboard/intelligence',  icon: BrainCircuit,},
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/60 flex flex-col justify-between p-4 shrink-0">
        <div>
          {/* Logo */}
          <Link href="/dashboard/overview" className="flex items-center gap-3 px-3 py-3 mb-6">
            <div className="h-9 w-9 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-slate-950 shadow-lg shadow-emerald-500/20">
              IQ
            </div>
            <div>
              <div className="font-bold text-base tracking-tight flex items-center gap-1.5">
                HireIQ <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-semibold px-1.5 py-0.5 rounded border border-emerald-500/20">NG</span>
              </div>
              <p className="text-[11px] text-slate-400">Recruitment Intelligence</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname?.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* AI Agent Status Pill */}
        <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-medium mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            AI Screening Engine Active
          </div>
          <p className="text-slate-400 text-[11px]">Calibrated for Nigerian tech & corporate markets.</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800 px-8 flex items-center justify-between bg-slate-900/30 backdrop-blur shrink-0">
          <div className="flex items-center gap-3 w-96 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-400">
            <Search className="h-4 w-4" />
            <input
              type="text"
              placeholder="Search candidates, skills, or job roles..."
              className="bg-transparent border-none outline-none text-slate-200 placeholder-slate-500 w-full"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500"></span>
            </button>
            <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-300">
              NG
            </div>
          </div>
        </header>

        {/* Dynamic Route Children */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}