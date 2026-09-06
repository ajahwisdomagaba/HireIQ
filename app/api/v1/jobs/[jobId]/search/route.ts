import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateEmbedding } from '@/lib/ai';

interface SearchResultRow {
  chunkId: string;
  resumeId: string;
  applicationId: string;
  candidateProfileId: string;
  candidateName: string;
  candidateEmail: string;
  chunkText: string;
  similarityScore: number;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const body = await req.json();
    const { query, limit = 5 } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { success: false, error: 'A query string is required' },
        { status: 400 }
      );
    }

    // 1. Verify job requisition exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { id: true, title: true },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job requisition not found' },
        { status: 404 }
      );
    }

    // 2. Convert query to vector embedding
    const queryVector = await generateEmbedding(query);
    const vectorString = `[${queryVector.join(',')}]`;

    // 3. Query PostgreSQL using pgvector cosine distance (<=>)
    const matches = await prisma.$queryRawUnsafe<SearchResultRow[]>(
      `
      SELECT 
        rc."id" AS "chunkId",
        rc."resumeId",
        a."id" AS "applicationId",
        cp."id" AS "candidateProfileId",
        u."name" AS "candidateName",
        u."email" AS "candidateEmail",
        rc."chunkText",
        ROUND((1 - (rc."embedding" <=> $1::vector))::numeric, 4) AS "similarityScore"
      FROM "ResumeChunk" rc
      JOIN "Resume" r ON rc."resumeId" = r."id"
      JOIN "Application" a ON a."resumeId" = r."id"
      JOIN "CandidateProfile" cp ON a."candidateProfileId" = cp."id"
      JOIN "User" u ON cp."userId" = u."id"
      WHERE a."jobId" = $2
      ORDER BY rc."embedding" <=> $1::vector ASC
      LIMIT $3;
      `,
      vectorString,
      jobId,
      limit
    );

    return NextResponse.json({
      success: true,
      query,
      jobTitle: job.title,
      resultsCount: matches.length,
      results: matches,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}