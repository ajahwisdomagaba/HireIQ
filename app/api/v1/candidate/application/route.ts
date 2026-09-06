import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, AppError } from '@/lib/errors';
import { requireAuth } from '@/lib/auth';
import { AccountRole } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth([AccountRole.CANDIDATE, AccountRole.RECRUITER]);

    const applications = await prisma.application.findMany({
      where: {
        candidateProfile: {
          userId: session.userId,
        },
      },
      include: {
        job: {
          include: {
            company: { select: { name: true, location: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ applications });
  } catch (err) {
    return handleApiError(err);
  }
}