import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AccountRole, ApplicationStage } from '@prisma/client';
import crypto from 'crypto';
import { resumeQueue } from '@/lib/queue';

export async function POST(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;

    // 1. Verify Job requisition exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job requisition not found' }, { status: 404 });
    }

    const payload = await req.json();

    // 2. Dynamic raw resume content extraction
    const rawResumeText =
      payload.resumeRawText ||
      payload.resumeText ||
      payload.resume ||
      payload.cvText ||
      payload.cv ||
      payload.text ||
      payload.content ||
      '';

    // 3. Dynamic Email Resolution
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const extractedEmail =
      typeof rawResumeText === 'string' ? rawResumeText.match(emailRegex)?.[0] : null;

    const email = (
      payload.email ||
      payload.emailAddress ||
      payload.contactEmail ||
      payload.candidateEmail ||
      extractedEmail ||
      `applicant-${crypto.randomBytes(4).toString('hex')}@hireiq-temp.internal`
    ).toLowerCase().trim();

    // 4. Dynamic Name Resolution
    const name =
      payload.fullName ||
      payload.name ||
      (payload.firstName && payload.lastName
        ? `${payload.firstName} ${payload.lastName}`
        : payload.firstName || null) ||
      email.split('@')[0].replace(/[._+-]/g, ' ') ||
      'Applicant';

    // 5. Dynamic Phone Resolution
    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4,6}/;
    const extractedPhone =
      typeof rawResumeText === 'string' ? rawResumeText.match(phoneRegex)?.[0] : null;

    const phoneNumber =
      payload.phoneNumber ||
      payload.phone ||
      payload.tel ||
      payload.mobile ||
      extractedPhone ||
      null;

    const headline =
      payload.headline ||
      payload.title ||
      payload.role ||
      payload.currentRole ||
      'Software Engineer';

    const location = payload.location || payload.city || payload.address || 'Lagos, Nigeria';
    const coverLetter = payload.coverLetter || payload.notes || payload.message || '';

    // 6. Find or create User with AccountRole.CANDIDATE
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          role: AccountRole.CANDIDATE,
          passwordHash: crypto.randomBytes(32).toString('hex'),
        },
      });
    }

    // 7. Find or create CandidateProfile
    let profile = await prisma.candidateProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      profile = await prisma.candidateProfile.create({
        data: {
          userId: user.id,
          phoneNumber,
          location,
          headline,
        },
      });
    }

    // 8. Prevent duplicate active application for same requisition
    const existingApp = await prisma.application.findFirst({
      where: {
        jobId: job.id,
        candidateProfileId: profile.id,
      },
    });

    if (existingApp) {
      return NextResponse.json(
        {
          error: 'Candidate has already applied for this requisition',
          applicationId: existingApp.id,
        },
        { status: 409 }
      );
    }

    // 9. Prepare Dynamic Resume Metadata matching Resume model requirements
    const fileName =
      payload.fileName ||
      payload.originalFilename ||
      `resume-${Date.now()}.txt`;

    const mimeType =
      payload.mimeType ||
      payload.contentType ||
      (fileName.endsWith('.pdf') ? 'application/pdf' : 'text/plain');

    const storageKey =
      payload.storageKey ||
      payload.key ||
      `resumes/${profile.id}/${Date.now()}-${fileName}`;

    const mergedContent = [coverLetter, rawResumeText].filter(Boolean).join('\n\n---\n\n') || 'Raw application text';

    const parsedJson = payload.parsedJson || {
      ingestionMethod: 'dynamic_api',
      extractedAt: new Date().toISOString(),
      rawLength: mergedContent.length,
    };

    // 10. Persist Resume and Application transactionally
    const application = await prisma.$transaction(async (tx) => {
      const resume = await tx.resume.create({
        data: {
          candidateProfileId: profile.id,
          storageKey,
          fileName,
          mimeType,
          rawText: mergedContent,
          parsedJson,
          version: 1,
        },
      });

      return await tx.application.create({
        data: {
          jobId: job.id,
          candidateProfileId: profile.id,
          resumeId: resume.id,
          stage: ApplicationStage.APPLIED,
        },
      });
    });

    console.log(`✅ [ATS] Application persisted: ${application.id} (Candidate: ${profile.id})`);
try {
  await resumeQueue.add('process-resume', {
    applicationId: application.id,
    resumeId: application.resumeId,
    candidateProfileId: profile.id,
    jobId: job.id,
    rawText: mergedContent,
    metadata: {
      email,
      name,
      fileName,
    },
  });
  console.log(`🚀 [Queue] Dispatched background processing for Application: ${application.id}`);
} catch (queueErr) {
  // Non-blocking: application is safe in DB even if Redis queue fails
  console.error('⚠️ [Queue] Failed to dispatch processing job:', queueErr);
}
    return NextResponse.json(
      {
        success: true,
        message: 'Application ingested successfully',
        applicationId: application.id,
        candidateProfileId: profile.id,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('❌ RAW PRISMA ERROR in /api/v1/jobs/[jobId]/apply:', err);
    return NextResponse.json(
      {
        error: err.message,
        meta: err.meta,
        code: err.code,
      },
      { status: 500 }
    );
  }
}