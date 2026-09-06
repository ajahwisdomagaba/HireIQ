import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Queue } from 'bullmq';
import { prisma } from '@/lib/prisma';
import { handleApiError, AppError } from '@/lib/errors';
import { gradeAssessmentSubmission } from '@/lib/ai/grading-agent';

const SubmitSchema = z.object({
  candidateCode: z.string().min(5),
  language: z.string().default('typescript'),
  timeTakenMinutes: z.number().default(30),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { assessmentId: string } }
) {
  try {
    const body = await req.json();
    const { candidateCode, language, timeTakenMinutes } = SubmitSchema.parse(body);

    const assessment = await prisma.assessment.findUnique({
      where: { id: params.assessmentId },
      include: {
        job: {
          include: {
            applications: {
              take: 1,
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    if (!assessment) {
      throw new AppError('Assessment not found', 404);
    }

    const application = assessment.job.applications[0];
    if (!application) {
      throw new AppError('No candidate application linked to this assessment', 400);
    }

    let version = await prisma.assessmentVersion.findFirst({
      where: { assessmentId: assessment.id },
    });

    if (!version) {
      version = await prisma.assessmentVersion.create({
        data: {
          assessmentId: assessment.id,
          version: 1,
          instructions: 'Implement a thread-safe sliding window rate limiter in TypeScript.',
        },
      });
    }

    // 1. Run AI Code Evaluation Agent via Qorebit
    const { grading, aiRunId } = await gradeAssessmentSubmission({
      problemStatement: 'Implement a thread-safe in-memory sliding window rate limiter in TypeScript.',
      candidateCode,
      language,
      timeTakenMinutes,
    });

    // 2. Persist to AssessmentSubmission
    const submission = await prisma.assessmentSubmission.create({
      data: {
        applicationId: application.id,
        assessmentVersionId: version.id,
        score: Math.round(grading.overallScore),
        feedbackSummary: grading.detailedFeedback,
        submissionPayload: {
          candidateCode,
          language,
          timeComplexity: grading.timeComplexity,
          spaceComplexity: grading.spaceComplexity,
          aiAssistanceLikelihood: grading.aiAssistanceLikelihood,
          rubricBreakdown: grading.rubricBreakdown,
          aiRunId,
        },
      },
    });

    // 3. Dispatch to BullMQ for asynchronous knowledge vectorization
    try {
      const knowledgeQueue = new Queue('knowledge-queue', {
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
        },
      });

      await knowledgeQueue.add('embed-submission', {
        eventType: 'ASSESSMENT_COMPLETED',
        companyId: assessment.job.companyId,
        payload: { submissionId: submission.id },
      });

      await knowledgeQueue.close();
    } catch {
      // Non-blocking in local development if Redis is offline
    }

    return NextResponse.json({
      message: 'Assessment graded successfully',
      submissionId: submission.id,
      grading,
    });
  } catch (err) {
    return handleApiError(err);
  }
}