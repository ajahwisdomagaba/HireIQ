import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { offerId: string } }
) {
  try {
    const { offerId } = params;

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
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    return NextResponse.json({ offer }, { status: 200 });
  } catch (err: any) {
    console.error('Error fetching offer:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}