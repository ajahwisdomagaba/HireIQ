import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, AppError } from '@/lib/errors';
import { OfferStatus, ApplicationStage } from '@prisma/client';
import { generateSealedOfferPdf } from '@/lib/pdf/generateOfferPdf';
import fs from 'fs';
import path from 'path';

export async function POST(
  req: NextRequest,
  { params }: { params: { offerId: string } }
) {
  try {
    const { offerId } = params;
    const body = await req.json().catch(() => ({}));
    const { signatureBase64 } = body;

    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
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
    });

    if (!offer) {
      throw new AppError('Offer letter not found', 404);
    }

    if (offer.status === OfferStatus.ACCEPTED) {
      throw new AppError('This offer has already been accepted and executed', 400);
    }

    if (offer.status === OfferStatus.EXPIRED) {
      throw new AppError('This offer has expired. Contact the hiring team.', 400);
    }

    const signedAt = new Date();
    const monthlyGross = Math.round(offer.baseSalaryNGN / 12);
    const monthlyPension = Math.round(monthlyGross * 0.08);

    // 1. Generate Sealed PDF Buffer
    const pdfBytes = await generateSealedOfferPdf({
      offerId: offer.id,
      candidateName: offer.application?.candidateProfile?.user?.name || 'Candidate',
      jobTitle: offer.application?.job?.title || 'Software Engineer',
      baseSalaryNGN: offer.baseSalaryNGN,
      monthlyGrossNGN: monthlyGross,
      pensionMonthlyNGN: monthlyPension,
      signatureBase64,
      signedAt,
      signeeIp: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    // 2. Persist to public/offers directory
    const outputDir = path.join(process.cwd(), 'public', 'offers');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const fileName = `offer_${offer.id}.pdf`;
    const filePath = path.join(outputDir, fileName);
    fs.writeFileSync(filePath, Buffer.from(pdfBytes));

    const documentUrl = `/offers/${fileName}`;

    // 3. Atomic update: Mark offer ACCEPTED, set offerDocumentUrl, and set Application stage to HIRED
    const [updatedOffer] = await prisma.$transaction([
      prisma.offer.update({
        where: { id: offerId },
        data: {
          status: OfferStatus.ACCEPTED,
          signedAt,
          offerDocumentUrl: documentUrl,
        },
      }),
      prisma.application.update({
        where: { id: offer.applicationId },
        data: {
          stage: ApplicationStage.HIRED,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      offerId: updatedOffer.id,
      status: updatedOffer.status,
      signedAt: updatedOffer.signedAt,
      candidateName: offer.application.candidateProfile?.user?.name,
      documentUrl,
    });
  } catch (err) {
    return handleApiError(err);
  }
}