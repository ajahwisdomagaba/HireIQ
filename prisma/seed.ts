import {
  PrismaClient,
  AccountRole,
  JobStatus,
  RequirementType,
  ApplicationStage,
  RecommendationVerdict,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for HireIQ...');

  // 1. Create / Upsert Company
  const company = await prisma.company.upsert({
    where: { slug: 'kuda-technologies' },
    update: {},
    create: {
      name: 'Kuda Technologies',
      slug: 'kuda-technologies',
      industry: 'Fintech',
      location: 'Lagos, Nigeria',
    },
  });

  // 2. Create Engineering Department
  const engineeringDept = await prisma.department.upsert({
    where: {
      companyId_name: {
        companyId: company.id,
        name: 'Core Banking Engineering',
      },
    },
    update: {},
    create: {
      companyId: company.id,
      name: 'Core Banking Engineering',
    },
  });

  // 3. Create Recruiter User + RecruiterProfile
  const recruiterUser = await prisma.user.upsert({
    where: { email: 'recruiter@kuda.com' },
    update: {},
    create: {
      email: 'recruiter@kuda.com',
      passwordHash: '$2b$10$epV8/exampleHashedPasswordHere.secure',
      name: 'Amaka Eze',
      role: AccountRole.RECRUITER,
      recruiterProfile: {
        create: {
          companyId: company.id,
          title: 'Senior Technical Recruiter',
        },
      },
    },
  });

  // 4. Create Job with Requirements
  const job = await prisma.job.create({
    data: {
      companyId: company.id,
      departmentId: engineeringDept.id,
      title: 'Senior Backend Engineer (Node.js & PostgreSQL)',
      location: 'Lagos, Nigeria (Hybrid)',
      employmentType: 'Full-time',
      experienceLevel: 'Senior',
      rawDescription:
        'Lead core transaction processing microservices, maintain data pipelines, and design high-throughput PostgreSQL architectures.',
      salaryMinNGN: 2500000,
      salaryMaxNGN: 4000000,
      status: JobStatus.ACTIVE,
      requirements: {
        create: [
          {
            title: 'Node.js & TypeScript Mastery',
            requirementType: RequirementType.MANDATORY,
            weight: 5,
            description: '5+ years building distributed backend services with Node.js and TypeScript.',
            skillCategory: 'Backend',
          },
          {
            title: 'PostgreSQL & Query Optimization',
            requirementType: RequirementType.MANDATORY,
            weight: 4,
            description: 'Proficiency with indexing, query execution plans, and schema design.',
            skillCategory: 'Database',
          },
          {
            title: 'Vector Search / AI Experience',
            requirementType: RequirementType.BONUS,
            weight: 2,
            description: 'Familiarity with pgvector embeddings and LLM orchestration.',
            skillCategory: 'AI/ML',
          },
        ],
      },
    },
  });

  // 5. Create Candidate User + Profile + Resume
  const candidateUser = await prisma.user.upsert({
    where: { email: 'candidate@hireiq.dev' },
    update: {},
    create: {
      email: 'candidate@hireiq.dev',
      passwordHash: '$2b$10$epV8/exampleCandidateHashedPassword.secure',
      name: 'Tunde Bakare',
      role: AccountRole.CANDIDATE,
      candidateProfile: {
        create: {
          headline: 'Senior Full-Stack & Systems Engineer',
          location: 'Lagos, Nigeria',
          phoneNumber: '+2348012345678',
          skills: {
            create: [
              { name: 'TypeScript', yearsOfExperience: 5.0, verifiedByAi: true },
              { name: 'PostgreSQL', yearsOfExperience: 6.0, verifiedByAi: true },
              { name: 'Next.js', yearsOfExperience: 3.5, verifiedByAi: true },
            ],
          },
          workHistories: {
            create: [
              {
                companyName: 'Paystack',
                jobTitle: 'Senior Software Engineer',
                startDate: new Date('2021-03-01'),
                isCurrent: true,
                description: 'Scaled payment gateway webhooks handling over 20M requests daily.',
              },
            ],
          },
          educations: {
            create: [
              {
                institutionName: 'University of Lagos',
                degree: 'B.Sc.',
                fieldOfStudy: 'Computer Science',
                graduationYear: 2019,
              },
            ],
          },
        },
      },
    },
    include: {
      candidateProfile: true,
    },
  });

  const candidateProfileId = candidateUser.candidateProfile!.id;

  // 6. Create Resume record
  const resume = await prisma.resume.create({
    data: {
      candidateProfileId,
      storageKey: 'resumes/tunde-bakare-cv.pdf',
      fileName: 'Tunde_Bakare_Resume.pdf',
      mimeType: 'application/pdf',
      rawText: 'Tunde Bakare - Senior Software Engineer with 5+ years specializing in TypeScript, Node.js, and PostgreSQL.',
      parsedJson: {
        summary: 'Senior Software Engineer with 5+ years experience in Fintech applications.',
        skills: ['TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'Redis'],
      },
    },
  });

  // 7. Create Application & AI Screening Session
  await prisma.application.create({
    data: {
      jobId: job.id,
      candidateProfileId,
      resumeId: resume.id,
      stage: ApplicationStage.AI_SCREENED,
      screeningSessions: {
        create: [
          {
            overallScore: 92,
            verdict: RecommendationVerdict.STRONG_HIRE,
            summaryReasoning:
              'Candidate possesses extensive fintech domain background with strong PostgreSQL optimizations directly matching job requirements.',
            requirementMatches: {
              create: [
                {
                  requirementTitle: 'Node.js & TypeScript Mastery',
                  isMet: true,
                  score: 95,
                  evidenceFromCv: '5+ years building backend microservices at Paystack.',
                },
                {
                  requirementTitle: 'PostgreSQL & Query Optimization',
                  isMet: true,
                  score: 90,
                  evidenceFromCv: 'Scaled payment webhook storage with relational indexing.',
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });