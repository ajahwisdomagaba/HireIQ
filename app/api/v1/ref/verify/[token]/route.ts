import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/errors';

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    // Resolve candidate application by token (or fallback to applicationId)
    const application = await prisma.application.findFirst({
      where: {
        OR: [{ id: token }],
      },
      include: {
        candidateProfile: {
          include: { user: true },
        },
        job: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Invalid or expired referee verification token.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      candidateName: application.candidateProfile?.user?.name || 'The Candidate',
      jobTitle: application.job?.title || 'Software Engineer',
      companyName: 'HireIQ Client Network',
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    const body = await req.json();

    const {
      refereeName,
      refereeTitle,
      relationship,
      confirmedTenure,
      tenureDiscrepancy,
      technicalRating,
      integrityRating,
      comments,
    } = body;

    const application = await prisma.application.findFirst({
      where: {
        OR: [{ id: token }],
      },
      include: {
        candidateProfile: {
          include: { user: true },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Invalid verification token.' },
        { status: 404 }
      );
    }

    // Heuristic AI Inconsistency Check:
    // Flag if tenure is disputed or if integrity rating is less than 3
    const hasInconsistency = !confirmedTenure || integrityRating < 3;
    const inconsistencyNote = !confirmedTenure
      ? `Tenure discrepancy flagged by ${refereeName}: claimed dates do not match records.`
      : integrityRating < 3
      ? `Integrity/conduct rating low (${integrityRating}/5) flagged by ${refereeName}.`
      : null;

    const verificationRecord = {
      applicationId: application.id,
      candidateName: application.candidateProfile?.user?.name,
      refereeName,
      refereeTitle,
      relationship,
      technicalRating: Number(technicalRating),
      integrityRating: Number(integrityRating),
      confirmedTenure,
      tenureDiscrepancy: tenureDiscrepancy || null,
      comments,
      inconsistencyFlagged: hasInconsistency,
      inconsistencyReason: inconsistencyNote,
      verifiedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Reference verification submitted successfully.',
        verification: verificationRecord,
      },
      { status: 200 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}