import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/errors';
import { calculateNigerianPayroll } from '@/lib/payroll/statutory';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      offerId,
      bankName,
      bankCode,
      accountNumber,
      accountName,
      bvn,
      pfaName,
      rsaPin,
    } = body;

    if (!offerId || !accountNumber || !bankName) {
      return NextResponse.json(
        { error: 'Missing required payroll details: offerId, bankName, and accountNumber are required.' },
        { status: 400 }
      );
    }

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
      return NextResponse.json({ error: 'Offer record not found.' }, { status: 404 });
    }

    const breakdown = calculateNigerianPayroll(offer.baseSalaryNGN);

    // Update application stage to HIRED if not already updated
    await prisma.application.update({
      where: { id: offer.applicationId },
      data: { stage: 'HIRED' },
    });

    const payrollProfile = {
      offerId: offer.id,
      candidateName: offer.application?.candidateProfile?.user?.name,
      candidateEmail: offer.application?.candidateProfile?.user?.email,
      role: offer.application?.job?.title,
      banking: {
        bankName,
        bankCode: bankCode || '058',
        accountNumber,
        accountName: accountName || offer.application?.candidateProfile?.user?.name,
        bvnMasked: bvn ? `******${bvn.slice(-4)}` : 'N/A',
      },
      pension: {
        pfaName: pfaName || 'Stanbic IBTC Pension Managers',
        rsaPin: rsaPin || 'PEN100000000000',
      },
      statutory: breakdown,
      provisionedAt: new Date().toISOString(),
      status: 'ACTIVE_PAYROLL',
    };

    return NextResponse.json({ payrollProfile }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}