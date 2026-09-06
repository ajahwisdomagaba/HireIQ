
async function runTestApply() {
  // 1. Fetch latest active job to apply to
  const jobsRes = await fetch('http://localhost:3000/api/v1/jobs');
  const jobsData = await jobsRes.json();

  if (!jobsData.jobs || jobsData.jobs.length === 0) {
    console.error('No jobs found in the database. Publish a job first.');
    process.exit(1);
  }

  const targetJob = jobsData.jobs[0];
  console.log(`Targeting Job Requisition: [${targetJob.id}] "${targetJob.title}"`);

  // 2. Mock Nigerian Tech Candidate Payload
  const candidatePayload = {
    fullName: 'Chinedu Adeleke',
    email: `chinedu.adeleke+${Date.now()}@example.com`,
    phone: '+2348031234567',
    linkedinUrl: 'https://linkedin.com/in/chinedu-adeleke-dev',
    githubUrl: 'https://github.com/chinedu-adeleke',
    portfolioUrl: 'https://chinedu.dev',
    coverLetter:
      'Excited about building high-throughput payment architectures in Lagos. Experienced with Node.js, Express, and distributed systems.',
    resumeRawText: `
      CHINEDU ADELEKE
      Lagos, Nigeria | chinedu.adeleke@example.com
      
      PROFESSIONAL SUMMARY
      Software Engineer with 2 years of hands-on experience building REST APIs, asynchronous workers, and backend microservices using TypeScript, Node.js, and PostgreSQL.
      
      EXPERIENCE
      Junior Backend Developer | PayWave Africa (Lagos, NG)
      - Designed transaction verification endpoints handling 5,000+ daily webhooks.
      - Integrated Redis caching layers to reduce database latency by 45%.
      - Maintained Jest unit and integration test suites.
      
      SKILLS
      TypeScript, Node.js, Express, PostgreSQL, Prisma ORM, Redis, Docker, Git.
      
      EDUCATION
      B.Sc Computer Science - University of Lagos (UNILAG)
    `,
  };

  // 3. Post to Application Route
  const applyRes = await fetch(`http://localhost:3000/api/v1/jobs/${targetJob.id}/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(candidatePayload),
  });

  const applyData = await applyRes.json();
  console.log('API Response Status:', applyRes.status);
  console.log('Result:', applyData);
}

runTestApply();