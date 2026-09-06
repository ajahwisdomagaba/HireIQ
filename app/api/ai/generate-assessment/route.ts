import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, AppError } from '@/lib/errors';
import { requireAuth } from '@/lib/auth';
import { AccountRole } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth([AccountRole.RECRUITER, AccountRole.COMPANY_ADMIN]);
    const { jobId, roleTitle, seniority, domain } = await req.json();

    let targetJobId = jobId;

    // Fallback: If no specific jobId provided, grab the first job for the recruiter's company
    if (!targetJobId) {
      const firstJob = await prisma.job.findFirst({
        where: { companyId: session.companyId },
      });
      if (!firstJob) {
        throw new AppError('No active job requisition found to bind assessment', 404);
      }
      targetJobId = firstJob.id;
    }

    const title = `${seniority || 'Senior'} ${roleTitle || 'Backend Engineer'} Technical Challenge`;
    const instructions = `Solve real-world challenges reflecting Nigerian production environments (${domain || 'Fintech, Distributed Ledgers & High-Concurrency Systems'}). Focus on idempotency, transactional isolation, and low latency.`;

    // 1. Create Assessment + AssessmentVersion + AssessmentQuestions in Prisma
    const createdAssessment = await prisma.assessment.create({
      data: {
        jobId: targetJobId,
        title,
        versions: {
          create: {
            version: 1,
            instructions,
            questions: {
              create: [
                {
                  orderIndex: 0,
                  prompt: `Implement an idempotent webhook processor for payment events (e.g., Paystack/Flutterwave). Ensure duplicate events within an 86400-second TTL do not result in double balance credits.`,
                  evaluationCriteria: 'Atomic transactions, Redis/in-memory lock verification, proper signature validation, error status codes.',
                  testCases: [
                    { name: 'Duplicate Webhook Replay', expected: '409 Conflict or Deduplicated 200' },
                    { name: 'Atomic Credit', expected: 'Exact single balance increment' },
                  ],
                },
                {
                  orderIndex: 1,
                  prompt: `Analyze the following scenario: A sudden spike in USSD traffic causes DB connection pool exhaustion on your AWS us-east-2 instances during Lagos business hours (11:00 AM WAT). Describe your immediate remediation strategy.`,
                  evaluationCriteria: 'PgBouncer/Neon connection pool tuning, read-replica offloading, exponential backoff, rate limiting at edge.',
                },
              ],
            },
          },
        },
      },
      include: {
        versions: {
          include: {
            questions: true,
          },
        },
      },
    });

    const activeVersion = createdAssessment.versions[0];

    return NextResponse.json({
      success: true,
      assessment: {
        id: createdAssessment.id,
        jobId: createdAssessment.jobId,
        roleTitle: createdAssessment.title,
        durationMinutes: 45,
        difficulty: seniority || 'Senior',
        description: activeVersion.instructions,
        questions: activeVersion.questions.map((q) => ({
          id: q.id,
          title: q.orderIndex === 0 ? 'Webhook Idempotency Engine' : 'Connection Pool Incident Response',
          type: q.orderIndex === 0 ? 'coding' : 'situational_scenario',
          context: 'Lagos Fintech ecosystem experiencing high network fluctuations and intermittent bank webhook retries.',
          prompt: q.prompt,
          starterCode:
            q.orderIndex === 0
              ? `export async function handleWebhookEvent(event: { eventId: string; amount: number; accountId: string }): Promise<{ status: number; message: string }> {\n  // Implement atomic deduplication & ledger balance credit\n  \n  return { status: 200, message: "Processed" };\n}`
              : undefined,
        })),
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}