import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function checkVector() {
  try {
    await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector;`);
    console.log('✅ pgvector extension is installed and ready.');
  } catch (err: any) {
    console.error('⚠️ pgvector setup check failed:', err.message);
  } finally {
    process.exit(0);
  }
}

checkVector();