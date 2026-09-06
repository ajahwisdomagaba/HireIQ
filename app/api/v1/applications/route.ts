// app/api/v1/applications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/errors';
import { requireAuth } from '@/lib/auth';
import { AccountRole, ApplicationStage } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth([AccountRole.RECRUITER, AccountRole.COMPANY_ADMIN]);
    const { searchParams } = new URL(req.url);
    const stageParam = searchParams.get('stage');

    const whereClause: any = {
      job: {
        companyId: session.companyId,
      },
    };

    if (stageParam && Object.values(ApplicationStage).includes(stageParam as ApplicationStage)) {
      whereClause.stage = stageParam as ApplicationStage;
    }

    const applications = await prisma.application.findMany({
      where: whereClause,
      include: {
        job: { select: { id: true, title: true } },
        candidateProfile: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
            workHistories: {
              orderBy: { startDate: 'desc' },
              take: 2,
            },
          },
        },
        candidateReports: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ applications });
  } catch (err) {
    return handleApiError(err);
  }
}