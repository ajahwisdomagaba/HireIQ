import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/errors';

export async function POST(
  req: NextRequest,
  { params }: { params: { offerId: string } }
) {
  try {
    const { offerId } = params;
    const body = await req.json().catch(() => ({}));
    const validityDays = body.validityDays || 7;

    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
    });

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + Number(validityDays));

    const updatedOffer = await prisma.offer.update({
      where: { id: offerId },
      data: {
        status: 'SENT',
        expiresAt,
      },
    });

    return NextResponse.json({ offer: updatedOffer }, { status: 200 });
  } catch (err) {
    return handleApiError(err);
  }
}