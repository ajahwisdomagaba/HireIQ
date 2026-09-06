// src/app/(recruiter)/dashboard/jobs/[jobId]/applicants/page.tsx
'use client';

import { useState } from 'react';
import { Upload, AlertTriangle, CheckCircle2 } from 'lucide-react';
// Import logic refactored from CvUploadAndScreenModal.tsx

export default function JobApplicantsPage({ params }: { params: { jobId: string } }) {
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Applicant Screening & Match Pipeline</h1>
          <p className="text-sm text-slate-400">Job ID: {params.jobId}</p>
        </div>
      </div>
      
      {/* Upload Zone & Screening Results Table */}
    </div>
  );
}