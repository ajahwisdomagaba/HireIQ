import 'dotenv/config';
import { publishDomainEvent, DomainEventType } from '../lib/events';
import { prisma } from '../lib/prisma';

async function run() {
  console.log('📡 Publishing test APPLICATION_SUBMITTED domain event...');

  // Grab the seeded company from your database
  const company = await prisma.company.findFirst();
  if (!company) {
    throw new Error('No company found. Run database seed first.');
  }

  await publishDomainEvent(
    DomainEventType.APPLICATION_SUBMITTED,
    company.id,
    {
      applicationId: 'app_test_12345',
      candidateProfileId: 'cand_test_67890',
      jobId: 'job_test_abcde',
      resumeId: 'res_test_fghij',
      storageKey: 'resumes/test-resume.pdf',
    }
  );

  console.log('✅ Event published successfully to Upstash Redis queue!');
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Failed to publish event:', err);
  process.exit(1);
});