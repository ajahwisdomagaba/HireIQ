import { Worker, Job } from 'bullmq';
import { redisConnection, RESUME_QUEUE_NAME } from '../lib/queue';
import { prisma } from '../lib/prisma';
import { generateEmbedding, evaluateCandidateResume } from '../lib/ai';
import { ApplicationStage, RecommendationVerdict, InflationSeverity } from '@prisma/client';

function chunkTextDynamically(text: string, maxChunkSize = 800, overlap = 100): string[] {
  if (!text || typeof text !== 'string') return [];
  const clean = text.trim();
  if (clean.length <= maxChunkSize) return [clean];

  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < clean.length) {
    let endIndex = startIndex + maxChunkSize;
    if (endIndex < clean.length) {
      const nextSpace = clean.lastIndexOf(' ', endIndex);
      if (nextSpace > startIndex) endIndex = nextSpace;
    }

    const chunk = clean.slice(startIndex, endIndex).trim();
    if (chunk) chunks.push(chunk);

    startIndex = endIndex - overlap;
    if (startIndex >= clean.length || endIndex >= clean.length) break;
  }

  return chunks;
}

console.log('⚡ [Worker] Starting AI Screening & Embedding Worker...');

export const resumeWorker = new Worker(
  RESUME_QUEUE_NAME,
  async (job: Job) => {
    const { applicationId, resumeId, jobId, rawText } = job.data;
    console.log(`\n📦 [Worker] Ingesting Application ${applicationId} for Requisition: ${jobId}`);

    if (!resumeId || !rawText || !jobId) {
      console.warn(`[Worker] Missing required payload data. Skipping.`);
      return;
    }

    // 1. Fetch Requisition Details & Requirements
    const jobData = await prisma.job.findUnique({
      where: { id: jobId },
      include: { requirements: true },
    });

    if (!jobData) {
      throw new Error(`Job requisition ${jobId} not found`);
    }

    // 2. Dynamic Chunking
    const textChunks = chunkTextDynamically(rawText);
    console.log(`🧩 [Worker] Generated ${textChunks.length} chunks. Generating embeddings...`);

    // 3. Persist Chunks with Vector Embeddings
    for (const chunk of textChunks) {
      const embedding = await generateEmbedding(chunk);
      const chunkId = `chk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      await prisma.$executeRawUnsafe(
        `INSERT INTO "ResumeChunk" ("id", "resumeId", "chunkText", "embedding", "createdAt")
         VALUES ($1, $2, $3, $4::vector, NOW())`,
        chunkId,
        resumeId,
        chunk,
        JSON.stringify(embedding)
      );
    }

    // 4. Update Resume Status
    await prisma.resume.update({
      where: { id: resumeId },
      data: {
        parsedJson: {
          processedAt: new Date().toISOString(),
          totalChunks: textChunks.length,
          status: 'CHUNKED_AND_EMBEDDED',
        },
      },
    });

    // 5. Run AI Screening Evaluation via Qorebit
    console.log(`[Worker] Running AI screening agent against ${jobData.requirements.length} requirements...`);
    const screening = await evaluateCandidateResume(
      jobData.title,
      jobData.rawDescription,
      jobData.requirements,
      rawText
    );

    // 6. Persist ScreeningSession, Matches, Inflation Signals, and Update Stage
    await prisma.$transaction(async (tx) => {
      const session = await tx.screeningSession.create({
        data: {
          applicationId,
          overallScore: screening.overallScore,
          verdict: screening.verdict as RecommendationVerdict,
          summaryReasoning: screening.summaryReasoning,
        },
      });

      if (screening.requirementMatches?.length) {
        for (const match of screening.requirementMatches) {
          await tx.requirementScreenMatch.create({
            data: {
              screeningSessionId: session.id,
              requirementTitle: match.requirementTitle,
              isMet: match.isMet,
              score: match.score,
              evidenceFromCv: match.evidenceFromCv || 'No direct evidence found',
              missingElements: match.missingElements || null,
            },
          });
        }
      }

      if (screening.inflationSignals?.length) {
        for (const signal of screening.inflationSignals) {
          await tx.cvInflationSignal.create({
            data: {
              screeningSessionId: session.id,
              claimedStatement: signal.claimedStatement,
              suspicionReason: signal.suspicionReason,
              severity: signal.severity as InflationSeverity,
            },
          });
        }
      }

      await tx.application.update({
        where: { id: applicationId },
        data: {
          stage: ApplicationStage.AI_SCREENED,
        },
      });
    });

    console.log(`[Worker] Screening complete. Score: ${screening.overallScore} | Verdict: ${screening.verdict}`);
  },
  {
    connection: redisConnection,
    concurrency: 2,
  }
);

resumeWorker.on('completed', (job) => {
  console.log(`🎉 [Worker] Application processing marked COMPLETED (Job ${job.id})`);
});

resumeWorker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} FAILED:`, err.message);
});