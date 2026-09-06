import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testEdgeCases() {
  try {
    // 1. Fetch an active requisition directly from the database or API
    let targetJob = await prisma.job.findFirst({
      include: { requirements: true },
    });

    if (!targetJob) {
      console.error('❌ No job requisition found in the database. Please seed or create a job first.');
      await prisma.$disconnect();
      return;
    }

    console.log(`🎯 Targeting Requisition: [${targetJob.id}] "${targetJob.title}"`);

    // 2. Dynamic raw unformatted payload with embedded candidate info
    const rawDumpPayload = {
      resumeRawText: `
        Fatima Bello
        fatima.bello.${Date.now()}@lagostech.ng
        +2348029988776
        Software Engineer with 4 years building scalable backend services using Node.js, Express, TypeScript, and PostgreSQL.
        Experienced in BullMQ asynchronous job architectures and RESTful API design.
        Led migration of legacy monolithic endpoints to microservices with 99.9% uptime.
      `,
    };

    console.log('📤 Submitting candidate application to /apply...');
    const res = await fetch(`http://localhost:3000/api/v1/jobs/${targetJob.id}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rawDumpPayload),
    });

    const result = await res.json();
    console.log(`Status: ${res.status}`);
    console.log('Result:', result);
  } catch (err) {
    console.error('❌ Script execution error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

testEdgeCases();