import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateSealedOfferPdf } from '@/lib/pdf/generateOfferPdf';

export async function GET(
  req: NextRequest,
  { params }: { params: { offerId: string } }
) {
  try {
    const { offerId } = params;

    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        application: {
          include: {
            candidateProfile: { include: { user: true } },
            job: true,
          },
        },
      },
    });

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    const monthlyGross = Math.round(offer.baseSalaryNGN / 12);
    const monthlyPension = Math.round(monthlyGross * 0.08);

    const pdfBytes = await generateSealedOfferPdf({
      offerId: offer.id,
      candidateName: offer.application?.candidateProfile?.user?.name || 'Candidate',
      jobTitle: offer.application?.job?.title || 'Software Engineer',
      baseSalaryNGN: offer.baseSalaryNGN,
      monthlyGrossNGN: monthlyGross,
      pensionMonthlyNGN: monthlyPension,
      signedAt: offer.signedAt || offer.updatedAt || new Date(),
    });

    return new Response(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Offer_${(
          offer.application?.candidateProfile?.user?.name || 'Candidate'
        ).replace(/\s+/g, '_')}.pdf"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to generate PDF' }, { status: 500 });
  }
}