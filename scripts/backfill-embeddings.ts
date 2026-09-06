import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { generateEmbedding } from '../lib/ai/embeddings';

async function backfillKnowledgeEmbeddings() {
  console.log('🔄 Checking for unindexed knowledge chunks...');

  // Fetch chunks without vector embeddings
  const chunks = await prisma.$queryRaw<
    { id: string; chunkContent: string }[]
  >`
    SELECT id, "chunkContent" 
    FROM "KnowledgeChunk" 
    WHERE embedding IS NULL
    LIMIT 50;
  `;

  if (chunks.length === 0) {
    console.log('✅ All knowledge chunks are already indexed.');
    process.exit(0);
  }

  console.log(`Found ${chunks.length} chunks to vectorize...`);

  for (const chunk of chunks) {
    try {
      const vector = await generateEmbedding(chunk.chunkContent);
      const vectorString = `[${vector.join(',')}]`;

      // Update the vector column using raw SQL
      await prisma.$executeRaw`
        UPDATE "KnowledgeChunk"
        SET embedding = ${vectorString}::vector
        WHERE id = ${chunk.id};
      `;

      console.log(` Indexed chunk: ${chunk.id}`);
    } catch (err: any) {
      console.error(` Failed to embed chunk ${chunk.id}:`, err.message);
    }
  }

  console.log('✅ Embedding backfill complete.');
  process.exit(0);
}

backfillKnowledgeEmbeddings();