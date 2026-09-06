import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/errors';
import { requireAuth } from '@/lib/auth';
import { AccountRole } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth([AccountRole.RECRUITER, AccountRole.COMPANY_ADMIN]);

    const interviews = await prisma.interview.findMany({
      where: {
        application: {
          job: {
            companyId: session.companyId,
          },
        },
      },
      include: {
        application: {
          include: {
            job: { select: { id: true, title: true } },
            candidateProfile: {
              include: {
                user: { select: { name: true, email: true } },
              },
            },
          },
        },
      },
      orderBy: {
        scheduledAt: 'desc',
      },
    });

    return NextResponse.json({ interviews });
  } catch (err) {
    return handleApiError(err);
  }
}
