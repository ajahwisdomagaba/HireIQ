import React from 'react';
import Link from 'next/link';

export default function RootPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 space-y-4">
      <h1 className="text-3xl font-bold text-white">HireIQ Platform</h1>
      <p className="text-sm text-slate-400">Evidence-backed ATS & Live Interview Engine</p>
      <Link 
        href="/dashboard/overview" 
        className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-emerald-400"
      >
        Open Recruiter Console
      </Link>
    </main>
  );
}
