import { prisma } from '../prisma';
import { generateEmbedding } from './embeddings';

export interface SemanticSearchResult {
  chunkId: string;
  sourceTitle: string;
  category: string;
  content: string;
  similarity: number;
}

export async function searchHiringMemory(params: {
  companyId: string;
  query: string;
  limit?: number;
  threshold?: number;
}): Promise<SemanticSearchResult[]> {
  const { companyId, query, limit = 10, threshold = 0.05 } = params;

  // 1. Generate query embedding vector
  const queryVector = await generateEmbedding(query);
  const vectorString = `[${queryVector.join(',')}]`;

  // 2. Query via pgvector cosine distance (<=>)
  // Supports matches within the recruiter's company, with flexible fallback
  const results = await prisma.$queryRaw<
    {
      id: string;
      chunkContent: string;
      title: string;
      category: string;
      similarity: number;
    }[]
  >`
    SELECT 
      kc.id,
      kc."chunkContent",
      ks.title,
      ks.category,
      1 - (kc.embedding <=> ${vectorString}::vector) AS similarity
    FROM "KnowledgeChunk" kc
    JOIN "KnowledgeSource" ks ON kc."knowledgeSourceId" = ks.id
    WHERE (ks."companyId" = ${companyId} OR ks."companyId" IS NULL)
      AND kc.embedding IS NOT NULL
      AND 1 - (kc.embedding <=> ${vectorString}::vector) >= ${threshold}
    ORDER BY similarity DESC
    LIMIT ${limit};
  `;

  return results.map((row) => ({
    chunkId: row.id,
    sourceTitle: row.title,
    category: row.category,
    content: row.chunkContent,
    similarity: Math.max(0, +row.similarity.toFixed(4)),
  }));
}