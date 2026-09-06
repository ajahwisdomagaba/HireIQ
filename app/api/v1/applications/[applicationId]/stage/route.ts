import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApplicationStage } from '@prisma/client';

const VALID_TRANSITIONS: Record<ApplicationStage, ApplicationStage[]> = {
  APPLIED: [ApplicationStage.AI_SCREENED, ApplicationStage.REJECTED],
  AI_SCREENED: [ApplicationStage.ASSESSMENT, ApplicationStage.INTERVIEW, ApplicationStage.REJECTED],
  ASSESSMENT: [ApplicationStage.INTERVIEW, ApplicationStage.REJECTED],
  INTERVIEW: [ApplicationStage.OFFER, ApplicationStage.REJECTED],
  OFFER: [ApplicationStage.HIRED, ApplicationStage.REJECTED],
  HIRED: [],
  REJECTED: [ApplicationStage.AI_SCREENED], // Allow re-opening for reconsideration
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const { applicationId } = await params;
    const body = await req.json();
    const { targetStage, reason } = body;

    if (!targetStage || !Object.values(ApplicationStage).includes(targetStage)) {
      return NextResponse.json(
        { success: false, error: `Invalid target stage: ${targetStage}` },
        { status: 400 }
      );
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: { id: true, stage: true, candidateProfileId: true },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    // State transition guard
    const allowed = VALID_TRANSITIONS[application.stage];
    if (!allowed.includes(targetStage)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid transition from ${application.stage} to ${targetStage}. Allowed next stages: ${allowed.join(', ') || 'None'}`,
        },
        { status: 422 }
      );
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: {
        stage: targetStage,
      },
      include: {
        candidateProfile: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Stage updated from ${application.stage} to ${targetStage}`,
      applicationId: updated.id,
      stage: updated.stage,
      candidate: {
        id: updated.candidateProfile.id,
        name: updated.candidateProfile.user?.name ?? 'Unknown',
        email: updated.candidateProfile.user?.email ?? 'Unknown',
        phoneNumber: updated.candidateProfile.phoneNumber,
        headline: updated.candidateProfile.headline,
      },
      auditNote: reason || null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}