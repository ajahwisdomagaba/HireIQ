import { prisma } from './lib/prisma';

async function testCompleteInterview() {
  // 1. Fetch an interview
  const interview = await prisma.interview.findFirst({
    where: {
      application: {
        job: { companyId: 'cmp_lagos_tech_01' }
      }
    },
    include: {
      application: {
        include: {
          candidateProfile: { include: { user: true } },
          job: true
        }
      }
    }
  });

  if (!interview) {
    console.error('No interview session found to test.');
    process.exit(1);
  }

  const candidateName = interview.application.candidateProfile.user.name;
  console.log(`Testing completion for: ${candidateName} (Interview ID: ${interview.id})`);

  // 2. Mock realistic interview transcript & recruiter notes
  const mockTranscript = `
[14:02] Interviewer: Welcome ${candidateName}. Can you walk us through how you handled payment switches and idempotency?
[14:03] ${candidateName}: At our previous role, we integrated Paystack and Interswitch webhooks. During salary spikes, we observed duplicate webhook retries within 50ms intervals. I implemented atomic Redis distributed locks with SHA-256 idempotency tokens and set up PostgreSQL row-level locks on candidate ledgers.
[14:06] Interviewer: How did you handle Redis cluster node failovers during Lagos ISP network flapping?
[14:07] ${candidateName}: We placed sentinel monitoring in place with read replicas in AWS eu-west-1, falling back to durable write-ahead log queues in Neon Postgres if in-memory cache connections failed.
[14:10] Interviewer: That addresses our core reliability criteria. Thank you!
  `.trim();

  const mockNotes = "Strong technical grasp of distributed locking and race condition mitigations. Clear understanding of Nigerian financial network peculiarities.";

  // 3. Update interview status to COMPLETED
  await prisma.interview.update({
    where: { id: interview.id },
    data: {
      status: 'COMPLETED',
      endedAt: new Date(),
      transcript: mockTranscript,
      recruiterNotes: mockNotes,
    }
  });
  console.log('✓ Interview marked as COMPLETED.');

  // 4. Upsert CandidateReport using findFirst -> update/create
  const existingReport = await prisma.candidateReport.findFirst({
    where: { applicationId: interview.applicationId }
  });

  const reportData = {
    matchScore: 92,
    verdict: 'STRONG_HIRE' as const,
    executiveSummary: `${candidateName} demonstrated senior-level competency in high-concurrency systems, atomic transactions, and fault-tolerant cloud architecture tailored to Nigerian production environments.`,
    strengths: [
      'Idempotent webhook pipeline architecture using Redis locks',
      'Demonstrated understanding of NIBSS/Paystack retry spikes',
      'Clear articulation of fallback mechanisms for local network fluctuations'
    ],
    weaknesses: [
      'Could deepen exposure to direct USSD gateway protocols'
    ],
    growthRoadmap: [
      'Deep dive into ISO 8583 banking specifications',
      'Lead microservices architecture transitions'
    ],
    marketSalaryBand: '₦1,800,000 - ₦2,400,000 gross monthly'
  };

  let report;
  if (existingReport) {
    report = await prisma.candidateReport.update({
      where: { id: existingReport.id },
      data: reportData
    });
  } else {
    report = await prisma.candidateReport.create({
      data: {
        applicationId: interview.applicationId,
        ...reportData
      }
    });
  }
  console.log('✓ CandidateReport persisted. Score:', report.matchScore, '| Verdict:', report.verdict);

  // 5. Index into KnowledgeFlywheel
  const knowledgeSource = await prisma.knowledgeSource.create({
    data: {
      companyId: 'cmp_lagos_tech_01',
      title: `Interview Transcript - ${candidateName} (${interview.application.job.title})`,
      category: 'INTERVIEW_TRANSCRIPT',
      rawContent: mockTranscript
    }
  });

  const chunk = await prisma.knowledgeChunk.create({
    data: {
      sourceId: knowledgeSource.id,
      chunkContent: mockTranscript.slice(0, 1500)
    }
  });
  console.log('✓ Knowledge Chunk indexed into flywheel. Source ID:', chunk.sourceId);

  console.log('\n--- VERIFICATION RESULT ---');
  console.log('Candidate Name   :', candidateName);
  console.log('Report Verdict   :', report.verdict);
  console.log('Market Band      :', report.marketSalaryBand);
  console.log('Flywheel Indexed : Yes');
  process.exit(0);
}

testCompleteInterview().catch(e => {
  console.error('Test execution failed:', e);
  process.exit(1);
});
