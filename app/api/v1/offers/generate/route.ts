import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { handleApiError, AppError } from '@/lib/errors';
import { requireAuth } from '@/lib/auth';
import { AccountRole } from '@prisma/client';

const OfferSchema = z.object({
  applicationId: z.string(),
  baseSalary: z.number().positive(),
  currency: z.string().default('NGN'),
  startDate: z.string(),
  signDeadline: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    await requireAuth([AccountRole.RECRUITER, AccountRole.COMPANY_ADMIN]);
    const body = await req.json();
    const data = OfferSchema.parse(body);

    const application = await prisma.application.findUnique({
      where: { id: data.applicationId },
      include: {
        candidateProfile: {
          include: {
            user: true,
          },
        },
        job: true,
      },
    });

    if (!application) {
      throw new AppError('Candidate application not found', 404);
    }

    const candidateName =
      (application as any).candidateProfile?.user?.name ||
      (application as any).candidateProfile?.fullName ||
      (application as any).candidate?.fullName ||
      'Candidate';

    const candidateEmail =
      (application as any).candidateProfile?.user?.email ||
      (application as any).candidate?.email ||
      '';

    const offerToken = `sig_${Math.random().toString(36).substring(2, 15)}`;

    const offerContract = {
      candidateName,
      candidateEmail,
      roleTitle: application.job.title,
      baseCompensation: `${data.currency} ${data.baseSalary.toLocaleString()}`,
      startDate: data.startDate,
      signDeadline: data.signDeadline,
      status: 'PENDING_SIGNATURE',
      signatureToken: offerToken,
      signingUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/app/offers/${offerToken}`,
    };

    return NextResponse.json({
      message: 'Offer letter prepared and dispatch ready',
      offer: offerContract,
    });
  } catch (err) {
    return handleApiError(err);
  }
}