import { prisma } from './lib/prisma';

async function seedOffer() {
  const application = await prisma.application.findFirst({
    where: {
      job: { companyId: 'cmp_lagos_tech_01' }
    },
    include: {
      candidateProfile: { include: { user: true } },
      job: true
    }
  });

  if (!application) {
    console.error('No application found');
    process.exit(1);
  }

  const existing = await prisma.offer.findFirst({
    where: { applicationId: application.id }
  });

  if (!existing) {
    const offer = await prisma.offer.create({
      data: {
        applicationId: application.id,
        baseSalaryNGN: 2400000,
        currency: 'NGN',
        status: 'SENT',
        offerDocumentUrl: `https://hireiq-docs.s3.eu-west-1.amazonaws.com/offers/${application.id}.pdf`,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });
    console.log(`✓ Created verified offer for: ${application.candidateProfile.user.name} (₦2,400,000/mo)`);
  } else {
    console.log(`Offer already exists for: ${application.candidateProfile.user.name}`);
  }
  process.exit(0);
}

seedOffer().catch(e => {
  console.error(e);
  process.exit(1);
});
