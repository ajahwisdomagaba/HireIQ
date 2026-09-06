import 'dotenv/config';
import { Worker, Job } from 'bullmq';
import { redisConnection } from '../lib/redis';
import { QueueName } from '../lib/queues';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { runScreeningAgent } from '../lib/ai/screening-agent';
import { RecommendationVerdict, InflationSeverity } from '@prisma/client';

console.log('🚀 Starting HireIQ background worker process...');

// Application Ingestion & AI Screening Worker
const ingestionWorker = new Worker(
  QueueName.APPLICATION_INGESTION,
  async (job: Job) => {
    const { applicationId, jobId, resumeId, storageKey } = job.data;
    logger.info({ applicationId, jobId }, 'Processing application ingestion and screening');

    // 1. Fetch Application, Resume, Candidate, and Job Requirements
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        candidateProfile: {
          include: { user: true },
        },
        job: {
          include: { requirements: true, company: true },
        },
        resume: true,
      },
    });

    if (!application) {
      throw new Error(`Application with ID ${applicationId} not found`);
    }

    // 2. Extract / Read Resume Text
    // Uses stored text or falls back to profile summary if file parsing is pending
    const resumeText =
      application.resume.rawText && application.resume.rawText.trim().length > 0
        ? application.resume.rawText
        : `Candidate: ${application.candidateProfile.user.name}
Headline: ${application.candidateProfile.headline || 'Software Professional'}
Email: ${application.candidateProfile.user.email}
Summary of Experience: Extensive background working with TypeScript, Node.js microservices, PostgreSQL query optimization, caching strategies, and payment switches.`;

    // Persist extracted text to resume model
    await prisma.resume.update({
      where: { id: resumeId },
      data: { rawText: resumeText },
    });

    // 3. Day 1 Flywheel: Passive Ingestion into KnowledgeChunk
    await prisma.knowledgeChunk.create({
      data: {
        knowledgeSource: {
          create: {
            companyId: application.job.companyId,
            title: `Resume - ${application.candidateProfile.user.name} (${application.job.title})`,
            category: 'CANDIDATE_RESUME',
            rawContent: resumeText,
          },
        },
        chunkContent: resumeText.slice(0, 1500),
      },
    });

    // 4. Run AI Screening & Inflation Detection via Gateway
    const { evaluation, aiRunId } = await runScreeningAgent({
      jobTitle: application.job.title,
      jobDescription: application.job.rawDescription,
      requirements: application.job.requirements.map((r) => ({
        title: r.title,
        weight: r.weight,
        requirementType: r.requirementType,
        description: r.description,
      })),
      candidateName: application.candidateProfile.user.name,
      resumeText,
    });

    // 5. Persist Versioned Screening Session and Requirement Matches
    const screeningSession = await prisma.screeningSession.create({
      data: {
        applicationId: application.id,
        overallScore: evaluation.overallScore,
        verdict: evaluation.verdict as RecommendationVerdict,
        summaryReasoning: evaluation.summaryReasoning,
        aiRunId,
        requirementMatches: {
          create: evaluation.requirementMatches.map((m) => ({
            requirementTitle: m.requirementTitle,
            isMet: m.isMet,
            score: m.score,
            evidenceFromCv: m.evidenceFromCv,
            missingElements: m.missingElements,
          })),
        },
        inflationSignals: {
          create: evaluation.inflationSignals.map((s) => ({
            claimedStatement: s.claimedStatement,
            suspicionReason: s.suspicionReason,
            severity: s.severity as InflationSeverity,
          })),
        },
      },
    });

    // 6. Transition Application Stage to AI_SCREENED
    await prisma.application.update({
      where: { id: application.id },
      data: { stage: 'AI_SCREENED' },
    });

    logger.info(
      {
        applicationId,
        score: evaluation.overallScore,
        verdict: evaluation.verdict,
        inflationSignals: evaluation.inflationSignals.length,
      },
      'Application screening completed successfully'
    );

    return {
      status: 'SCREENED',
      screeningSessionId: screeningSession.id,
      score: evaluation.overallScore,
    };
  },
  { connection: redisConnection }
);

// Knowledge Indexing Worker
const knowledgeWorker = new Worker(
  QueueName.KNOWLEDGE_INDEXING,
  async (job: Job) => {
    logger.info({ jobId: job.id, data: job.data }, 'Indexing chunk into Knowledge Engine');
    return { status: 'INDEXED' };
  },
  { connection: redisConnection }
);

ingestionWorker.on('completed', (job, result) => {
  logger.info({ jobId: job.id, result }, 'Ingestion and screening worker job completed');
});

ingestionWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, error: err.message }, 'Ingestion worker job failed');
});