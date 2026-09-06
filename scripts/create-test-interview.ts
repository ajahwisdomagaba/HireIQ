import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function run() {
  // 1. Find the seeded application
  const app = await prisma.application.findFirst({
    include: {
      job: { include: { company: true } },
      candidateProfile: { include: { user: true } },
    },
  });

  if (!app) {
    console.error('❌ No application found. Run seed script first.');
    process.exit(1);
  }

  // 2. Find or get the recruiter profile
  const recruiter = await prisma.recruiterProfile.findFirst();
  if (!recruiter) {
    console.error('❌ No recruiter found. Run seed script first.');
    process.exit(1);
  }

  // 3. Create an Interview row
  const interview = await prisma.interview.create({
    data: {
      applicationId: app.id,
      interviewerId: recruiter.id,
      stage: 'TECHNICAL',
      scheduledAt: new Date(),
      dailyRoomUrl: `https://hireiq.daily.co/room-${Date.now()}`,
      status: 'SCHEDULED',
    },
  });

  console.log('\n✅ Interview Created Successfully!');
  console.log(`Candidate: ${app.candidateProfile.user.name}`);
  console.log(`Role: ${app.job.title}`);
  console.log(`\n🔗 Open this URL in your browser:`);
  console.log(`http://localhost:3000/dashboard/interviews/${interview.id}/live\n`);

  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});