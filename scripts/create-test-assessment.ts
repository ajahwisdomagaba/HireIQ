import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function run() {
  const job = await prisma.job.findFirst();
  if (!job) {
    console.error('❌ No job found. Run database seeder first.');
    process.exit(1);
  }

  const assessment = await prisma.assessment.create({
    data: {
      jobId: job.id,
      title: `${job.title} - Technical Sandbox Challenge`,
    },
  });

  console.log(`\n✅ Assessment created: ${assessment.id}`);
  console.log(`🔗 Open in browser: http://localhost:3000/app/assessments/${assessment.id}\n`);
  process.exit(0);
}

run();