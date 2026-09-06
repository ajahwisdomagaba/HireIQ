import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { id: true, title: true, status: true },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job requisition not found' },
        { status: 404 }
      );
    }

    const applications = await prisma.application.findMany({
      where: { jobId },
      orderBy: { createdAt: 'desc' },
      include: {
        candidateProfile: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
        screeningSessions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            overallScore: true,
            verdict: true,
            summaryReasoning: true,
            requirementMatches: true,
            inflationSignals: true,
            createdAt: true,
          },
        },
      },
    });

    const stages = {
      APPLIED: [] as typeof applications,
      AI_SCREENED: [] as typeof applications,
      ASSESSMENT: [] as typeof applications,
      INTERVIEW: [] as typeof applications,
      OFFER: [] as typeof applications,
      HIRED: [] as typeof applications,
      REJECTED: [] as typeof applications,
    };

    applications.forEach((app) => {
      if (stages[app.stage]) {
        stages[app.stage].push(app);
      }
    });

    return NextResponse.json({
      success: true,
      job,
      totalCount: applications.length,
      pipeline: stages,
      applications,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}