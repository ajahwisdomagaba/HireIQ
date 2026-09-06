import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, AppError } from '@/lib/errors';
import { requireAuth } from '@/lib/auth';
import { AccountRole } from '@prisma/client';

export async function GET(
  req: NextRequest,
  { params }: { params: { applicationId: string } }
) {
  try {
    const session = await requireAuth([AccountRole.RECRUITER, AccountRole.COMPANY_ADMIN]);

    const application = await prisma.application.findUnique({
      where: { id: params.applicationId },
      include: {
        job: {
          include: { requirements: true },
        },
        candidateProfile: {
          include: {
            user: { select: { name: true, email: true } },
            skills: true,
            workHistories: true,
            educations: true,
          },
        },
        resume: true,
        screeningSessions: {
          orderBy: { version: 'desc' },
          take: 1,
          include: {
            requirementMatches: true,
            inflationSignals: true,
          },
        },
        assessmentSubmissions: {
          orderBy: { submittedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!application || application.job.companyId !== session.companyId) {
      throw new AppError('Candidate application not found', 404, 'NOT_FOUND');
    }

    return NextResponse.json({ application });
  } catch (err) {
    return handleApiError(err);
  }
}