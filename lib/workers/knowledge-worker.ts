import { Worker, Job } from 'bullmq';
import { prisma } from '../prisma';
import { generateEmbedding } from '../ai/embeddings';
import { logger } from '../logger';

const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

export const knowledgeWorker = new Worker(
  'knowledge-queue',
  async (job: Job) => {
    const { eventType, companyId, payload } = job.data;
    logger.info({ jobId: job.id, eventType }, 'Processing continuous knowledge ingestion job');

    let textContent = '';
    let sourceTitle = '';
    let category = 'GENERAL';

    if (eventType === 'INTERVIEW_COMPLETED') {
      const interview = await prisma.interview.findUnique({
        where: { id: payload.interviewId },
        include: {
          application: {
            include: {
              job: true,
              candidateProfile: { include: { user: true } },
            },
          },
        },
      });

      if (!interview) return;
      const candidateName =
        (interview.application as any).candidateProfile?.user?.name ||
        (interview.application as any).candidateProfile?.fullName ||
        'Candidate';

      sourceTitle = `Interview Transcript - ${candidateName} (${interview.application.job.title})`;
      category = 'INTERVIEW_TRANSCRIPT';
      textContent = (interview as any).transcript || '';
    } else if (eventType === 'ASSESSMENT_COMPLETED') {
      const submission = await prisma.assessmentSubmission.findUnique({
        where: { id: payload.submissionId },
        include: {
          application: {
            include: {
              job: true,
              candidateProfile: { include: { user: true } },
            },
          },
        },
      });

      if (!submission) return;
      const candidateName =
        (submission.application as any).candidateProfile?.user?.name ||
        (submission.application as any).candidateProfile?.fullName ||
        'Candidate';

      sourceTitle = `Assessment Solution - ${candidateName} (${submission.application.job.title})`;
      category = 'ASSESSMENT_SUBMISSION';
      const payloadData = submission.submissionPayload as any;
      textContent = `Candidate Code:\n${payloadData?.candidateCode || ''}\nFeedback:\n${submission.feedbackSummary || ''}`;
    }

    if (!textContent.trim()) return;

    // 1. Create KnowledgeSource record with required rawContent field
    const source = await prisma.knowledgeSource.create({
      data: {
        companyId,
        title: sourceTitle,
        category,
        rawContent: textContent,
      },
    });

    // 2. Partition text into chunks with overlap
    const chunks = partitionText(textContent, 500, 50);

    // 3. Generate embeddings & insert into KnowledgeChunk with vector type
    for (let i = 0; i < chunks.length; i++) {
      const content = chunks[i];
      const vector = await generateEmbedding(content);
      const vectorString = `[${vector.join(',')}]`;

      const chunk = await prisma.knowledgeChunk.create({
        data: {
          knowledgeSourceId: source.id,
          chunkContent: content,
          sequenceOrder: i,
        },
      });

      await prisma.$executeRaw`
        UPDATE "KnowledgeChunk"
        SET embedding = ${vectorString}::vector
        WHERE id = ${chunk.id};
      `;
    }

    logger.info({ sourceId: source.id, totalChunks: chunks.length }, 'Successfully vectorized knowledge chunks');
  },
  { connection: redisConnection, concurrency: 5 }
);

function partitionText(text: string, size: number, overlap: number): string[] {
  const result: string[] = [];
  let index = 0;
  while (index < text.length) {
    result.push(text.slice(index, index + size));
    index += size - overlap;
  }
  return result;
}