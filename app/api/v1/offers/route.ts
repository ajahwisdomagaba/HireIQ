import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const [offers, eligibleApplications] = await Promise.all([
      prisma.offer.findMany({
        include: {
          application: {
            include: {
              candidateProfile: {
                include: { user: true },
              },
              job: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      // Strictly candidates who are currently in the OFFER stage
      prisma.application.findMany({
        where: {
          stage: 'OFFER',
        },
        include: {
          candidateProfile: {
            include: { user: true },
          },
          job: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      }),
    ]);

    const enrichedOffers = offers.map((offer) => {
      const annualGross = offer.baseSalaryNGN;
      const monthlyGross = Math.round(annualGross / 12);
      const monthlyPension = Math.round(monthlyGross * 0.08);

      return {
        id: offer.id,
        applicationId: offer.applicationId,
        candidateName: offer.application?.candidateProfile?.user?.name || 'Unknown Candidate',
        candidateEmail: offer.application?.candidateProfile?.user?.email || 'N/A',
        jobTitle: offer.application?.job?.title || 'Role Unspecified',
        baseSalaryNGN: offer.baseSalaryNGN,
        monthlyGrossNGN: monthlyGross,
        monthlyPensionNGN: monthlyPension,
        currency: offer.currency,
        status: offer.status,
        signedAt: offer.signedAt,
        expiresAt: offer.expiresAt,
        createdAt: offer.createdAt,
        offerDocumentUrl: offer.offerDocumentUrl,
      };
    });

    const formattedEligible = eligibleApplications.map((app) => ({
      applicationId: app.id,
      candidateName: app.candidateProfile?.user?.name || 'Unnamed Candidate',
      jobTitle: app.job?.title || 'Unassigned Role',
      currentStage: app.stage,
    }));

    return NextResponse.json(
      { offers: enrichedOffers, eligibleCandidates: formattedEligible },
      { status: 200 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { applicationId, baseSalaryNGN } = body;

    if (!applicationId || !baseSalaryNGN) {
      return NextResponse.json(
        { error: 'Missing applicationId or baseSalaryNGN' },
        { status: 400 }
      );
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Guard: Only candidates in the OFFER stage can have an offer generated
    if (application.stage !== 'OFFER') {
      return NextResponse.json(
        { error: 'An offer can only be generated for candidates in the OFFER stage.' },
        { status: 400 }
      );
    }

    // Save initial state strictly as DRAFT (expiration & active sending handled on dispatch)
    const newOffer = await prisma.offer.create({
      data: {
        applicationId,
        baseSalaryNGN: Number(baseSalaryNGN),
        currency: 'NGN',
        status: 'DRAFT',
      },
    });

    return NextResponse.json({ offer: newOffer }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}