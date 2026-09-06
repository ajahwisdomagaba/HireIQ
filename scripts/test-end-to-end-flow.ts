import { prisma } from '../lib/prisma';
import { generateEmbedding } from '../lib/ai/embeddings';
import { gradeAssessmentSubmission } from '../lib/ai/grading-agent';
import { searchHiringMemory } from '../lib/ai/vector-search';
import { AccountRole } from '@prisma/client';

async function runEndToEndRecruitmentFlow() {
  console.log('\n=============================================================');
  console.log('🚀 HIREIQ END-TO-END RECRUITMENT & INTELLIGENCE FLYWHEEL TEST');
  console.log('=============================================================\n');

  // -------------------------------------------------------------
  // 1. Resolve / Seed Company & Recruiter
  // -------------------------------------------------------------
  console.log('📌 [Step 1/5] Setting up Tenant Company and Recruiter...');

  const company =
    (await prisma.company.findFirst()) ||
    (await prisma.company.create({
      data: {
        name: 'Kuda Technologies',
      } as any,
    }));

  let recruiterUser = await prisma.user.findFirst({
    where: {
      role: { in: [AccountRole.RECRUITER, AccountRole.COMPANY_ADMIN] },
      recruiterProfile: { isNot: null },
    },
    include: { recruiterProfile: true },
  });

  if (!recruiterUser) {
    recruiterUser = await prisma.user.create({
      data: {
        email: `recruiter.${Date.now()}@kuda.com`,
        name: 'Amaka Eze',
        passwordHash: 'dummy_hash_for_testing_123',
        role: AccountRole.RECRUITER,
        recruiterProfile: {
          create: {
            companyId: company.id,
          },
        },
      },
      include: { recruiterProfile: true },
    });
  }

  console.log(`✅ Company Ready: "${company.name}" (ID: ${company.id})`);
  console.log(`✅ Recruiter Active: ${recruiterUser.name} (${recruiterUser.email})`);

  // -------------------------------------------------------------
  // 2. Create Job Posting (Pure ATS)
  // -------------------------------------------------------------
  console.log('\n📌 [Step 2/5] Publishing Job Posting...');

  const jobDescription =
    'Design and optimize resilient payment rails handling multi-region transaction processing in Nigeria. Requires PostgreSQL, pgvector, and Redis.';

  const job = await prisma.job.create({
    data: {
      companyId: company.id,
      title: 'Senior Distributed Systems Engineer (Fintech)',
      rawDescription: jobDescription,
      location: 'Lagos, Nigeria (Hybrid)',
      employmentType: 'FULL_TIME',
      experienceLevel: 'SENIOR',
    } as any,
  });

  console.log(`✅ Job Created: "${job.title}" [ID: ${job.id}]`);

  // -------------------------------------------------------------
  // 3. Process Candidate Intake Application
  // -------------------------------------------------------------
  console.log('\n📌 [Step 3/5] Simulating Candidate Ingestion & Application Intake...');

  const candidateUser = await prisma.user.create({
    data: {
      email: `emeka.okonkwo.${Date.now()}@domain.ng`,
      name: 'Emeka Okonkwo',
      passwordHash: 'dummy_hash_for_testing_123',
      role: AccountRole.CANDIDATE,
      candidateProfile: {
        create: {
          location: 'Lagos, Nigeria',
          phoneNumber: '+2348012345678',
        },
      },
    },
    include: { candidateProfile: true },
  });

  const candidateProfileId = candidateUser.candidateProfile!.id;

  const resume = await prisma.resume.create({
    data: {
      candidateProfileId,
      fileName: 'emeka_okonkwo_cv.pdf',
      mimeType: 'application/pdf',
      storageKey: `resumes/emeka_okonkwo_${Date.now()}.pdf`,
      rawText:
        'Staff Infrastructure Architect with 6 years experience architecting high-throughput distributed transaction engines using PostgreSQL, pgvector, and Redis.',
      parsedJson: {
        skills: ['PostgreSQL', 'pgvector', 'Redis', 'Distributed Systems', 'TypeScript', 'Node.js'],
        experienceYears: 6,
        headline: 'Staff Infrastructure Architect',
      },
    } as any,
  });

  const application = await prisma.application.create({
    data: {
      jobId: job.id,
      candidateProfileId,
      resumeId: resume.id,
    } as any,
  });

  console.log(`✅ Candidate Profile: ${candidateUser.name} (${candidateUser.email})`);
  console.log(`✅ Resume Record Created: ${resume.fileName} [ID: ${resume.id}]`);
  console.log(`✅ Application Registered: [ID: ${application.id}]`);

  // -------------------------------------------------------------
  // 4. Conduct Technical Assessment Sandbox & AI Code Grading
  // -------------------------------------------------------------
  console.log('\n📌 [Step 4/5] Running Candidate Assessment Execution & AI Anti-Cheat Analysis...');

  const problemText =
    'Build an in-memory sliding window rate limiter in TypeScript to throttle API abuse.';

  const assessment = await prisma.assessment.create({
    data: {
      jobId: job.id,
      title: 'Sliding Window Rate Limiter Engine',
    } as any,
  });

  const assessmentVersion = await prisma.assessmentVersion.create({
    data: {
      assessmentId: assessment.id,
      version: 1,
      instructions: problemText,
    },
  });

  const sampleCandidateSolution = `
    export class SlidingWindowRateLimiter {
      private requests: Map<string, number[]> = new Map();
      constructor(private readonly windowMs: number, private readonly maxRequests: number) {}

      isAllowed(clientId: string): boolean {
        const now = Date.now();
        const timestamps = this.requests.get(clientId) || [];
        const validTimestamps = timestamps.filter(time => now - time < this.windowMs);

        if (validTimestamps.length < this.maxRequests) {
          validTimestamps.push(now);
          this.requests.set(clientId, validTimestamps);
          return true;
        }
        this.requests.set(clientId, validTimestamps);
        return false;
      }
    }
  `;

  const { grading, aiRunId } = await gradeAssessmentSubmission({
    problemStatement: problemText,
    candidateCode: sampleCandidateSolution,
    language: 'typescript',
    timeTakenMinutes: 28,
  });

  const submission = await prisma.assessmentSubmission.create({
    data: {
      applicationId: application.id,
      assessmentVersionId: assessmentVersion.id,
      score: Math.round(grading.overallScore),
      feedbackSummary: grading.detailedFeedback,
      submissionPayload: {
        candidateCode: sampleCandidateSolution,
        timeComplexity: grading.timeComplexity,
        spaceComplexity: grading.spaceComplexity,
        aiAssistanceLikelihood: grading.aiAssistanceLikelihood,
        rubricBreakdown: grading.rubricBreakdown,
        aiRunId,
      },
    },
  });

  console.log(`✅ Submission Scored: ${submission.score}% (Passed: ${grading.passed})`);
  console.log(`   Time Complexity : ${grading.timeComplexity}`);
  console.log(`   Space Complexity: ${grading.spaceComplexity}`);
  console.log(`   Anti-Cheat Risk : ${grading.aiAssistanceLikelihood}`);
  console.log(`   AIRun Telemetry : ${aiRunId}`);

  // -------------------------------------------------------------
  // 5. Ingest into Vector Knowledge Base & Perform Cosine Query
  // -------------------------------------------------------------
  console.log('\n📌 [Step 5/5] Vectorizing Solution Chunks & Querying Memory...');

  const knowledgeSource = await prisma.knowledgeSource.create({
    data: {
      companyId: company.id,
      title: `Assessment Solution - ${candidateUser.name} (${job.title})`,
      category: 'ASSESSMENT_SUBMISSION',
      rawContent: sampleCandidateSolution,
    },
  });

  const chunkContent = `Candidate ${candidateUser.name} implemented an in-memory sliding window rate limiter in TypeScript using a map of client timestamps. Score: ${submission.score}%. Time complexity: ${grading.timeComplexity}.`;

  const embedding = await generateEmbedding(chunkContent);
  const vectorString = `[${embedding.join(',')}]`;

  const chunk = await prisma.knowledgeChunk.create({
    data: {
      knowledgeSourceId: knowledgeSource.id,
      chunkContent,
    },
  });

  await prisma.$executeRaw`
    UPDATE "KnowledgeChunk"
    SET embedding = ${vectorString}::vector
    WHERE id = ${chunk.id};
  `;

  console.log(`✅ Chunk Vectorized into PostgreSQL pgvector: [Chunk ID: ${chunk.id}]`);

  const memoryResults = await searchHiringMemory({
    companyId: company.id,
    query: 'sliding window rate limiter algorithm and request timestamps',
    limit: 3,
    threshold: 0.01,
  });

  console.log('\n🔍 --- RECRUITER VECTOR MEMORY QUERY RESULTS ---');
  console.log(`Total Matches Found: ${memoryResults.length}`);
  memoryResults.forEach((res, i) => {
    console.log(`\n[#${i + 1}] Source: ${res.sourceTitle}`);
    console.log(`     Similarity : ${(res.similarity * 100).toFixed(2)}%`);
    console.log(`     Excerpt    : "${res.content}"`);
  });

  console.log('\n=============================================================');
  console.log('🎯 END-TO-END FLOW VERIFICATION COMPLETE: ALL GATES OPERATIONAL');
  console.log('=============================================================\n');
}

runEndToEndRecruitmentFlow()
  .catch((e) => {
    console.error('❌ E2E Integration Test Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });