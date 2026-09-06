import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, AppError } from '@/lib/errors';
import { getSession } from '@/lib/auth';
import { generateCandidateFeedback } from '@/lib/ai/feedback-agent';

export async function GET(
  req: NextRequest,
  { params }: { params: { applicationId: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AppError('Authentication required', 401);
    }

    const application = await prisma.application.findUnique({
      where: { id: params.applicationId },
      include: {
        job: { include: { company: true } },
        candidateProfile: { include: { user: true } },
        resume: true,
        candidateReports: { take: 1 },
        screeningSessions: {
          orderBy: { version: 'desc' },
          take: 1,
          include: { requirementMatches: true },
        },
      },
    });

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    // Authorization: Recruiter from the same company or the Candidate themselves
    const isOwnerCandidate = application.candidateProfile.userId === session.userId;
    const isCompanyRecruiter = session.companyId === application.job.companyId;

    if (!isOwnerCandidate && !isCompanyRecruiter) {
      throw new AppError('Access denied', 403);
    }

    // Return existing report if already generated
    const existingReport = application.candidateReports[0];
    if (existingReport) {
      return NextResponse.json({ report: existingReport });
    }

    const latestScreening = application.screeningSessions[0];
    const resumeText = application.resume?.rawText || 'Standard profile resume';

    // Generate roadmap using Feedback Agent
    const { roadmap } = await generateCandidateFeedback({
      candidateName: application.candidateProfile.user.name,
      jobTitle: application.job.title,
      companyName: application.job.company.name,
      resumeText,
      requirementMatches: latestScreening?.requirementMatches || [],
    });

    // Persist as CandidateReport
    const newReport = await prisma.candidateReport.create({
      data: {
        applicationId: application.id,
        matchScore: latestScreening?.overallScore || 50,
        verdict: latestScreening?.verdict || 'REJECT',
        executiveSummary: roadmap.executiveSummary,
        strengths: roadmap.strengthsIdentified,
        weaknesses: roadmap.primarySkillGaps.map((g) => `${g.skill}: ${g.gapDescription}`),
        growthRoadmap: roadmap.actionableUpskillingRoadmap as any,
        marketSalaryBand: {
          min: application.job.salaryMinNGN || 600000,
          max: application.job.salaryMaxNGN || 1200000,
          currency: 'NGN',
        },
      },
    });

    return NextResponse.json({ report: newReport, roadmap });
  } catch (err) {
    return handleApiError(err);
  }
}