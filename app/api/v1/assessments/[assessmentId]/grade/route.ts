import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, AppError } from '@/lib/errors';
import { gradeAssessmentSubmission } from '@/lib/ai/grading-agent';

export async function POST(
  req: NextRequest,
  { params }: { params: { assessmentId: string } }
) {
  try {
    const submissionId = params.assessmentId;

    // 1. Fetch submission with nested assessmentVersion -> assessment
    const submission = await prisma.assessmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assessmentVersion: {
          include: {
            assessment: true,
          },
        },
      },
    });

    if (!submission) {
      throw new AppError('Assessment submission not found', 404);
    }

    const assessment = submission.assessmentVersion?.assessment;
    const instructions = submission.assessmentVersion?.instructions || assessment?.title || '';
    const payload = submission.submissionPayload as Record<string, any> | null;
    const candidateCode = payload?.candidateCode || '';

    if (!candidateCode) {
      throw new AppError('No candidate code found in submission payload', 400);
    }

    // 2. Run AI Grading Engine
    const { grading, aiRunId } = await gradeAssessmentSubmission({
      problemStatement: instructions,
      candidateCode,
      language: payload?.language || 'typescript',
      timeTakenMinutes: payload?.timeTakenMinutes || 30,
    });

    // 3. Update submission record with correct schema fields
    const updatedSubmission = await prisma.assessmentSubmission.update({
      where: { id: submissionId },
      data: {
        score: Math.round(grading.overallScore),
        feedbackSummary: grading.detailedFeedback,
        submissionPayload: {
          ...(payload || {}),
          rubricBreakdown: grading.rubricBreakdown,
          timeComplexity: grading.timeComplexity,
          spaceComplexity: grading.spaceComplexity,
          aiAssistanceLikelihood: grading.aiAssistanceLikelihood,
          aiRunId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      submission: updatedSubmission,
      grading,
      aiRunId,
    });
  } catch (error) {
    return handleApiError(error);
  }
}