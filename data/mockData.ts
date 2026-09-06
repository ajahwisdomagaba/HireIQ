import { Job, Candidate, AssessmentTest, SalaryBenchmark, OfferLetterDetails } from '../types';

export const INITIAL_JOBS: Job[] = [
  {
    id: 'job-1',
    title: 'Senior Backend Engineer (Node.js/Fintech)',
    department: 'Core Infrastructure',
    location: 'Lagos (Victoria Island)',
    workType: 'Hybrid (Lagos)',
    salaryMinNaira: 1800000,
    salaryMaxNaira: 2800000,
    status: 'active',
    channels: ['Jobberman', 'LinkedIn', 'Telegram', 'CareersPage'],
    createdDate: '2026-08-14',
    description: 'We are seeking a Senior Backend Engineer to scale our Nigerian high-throughput payment switch. You will handle idempotent payment webhooks, NIBSS/Interswitch integrations, and sub-100ms transaction ledgers.',
    requirements: {
      mustHaveSkills: ['Node.js', 'TypeScript', 'PostgreSQL', 'Redis', 'Idempotency', 'Distributed Systems'],
      niceToHaveSkills: ['Paystack API', 'Moniepoint Switch', 'Kafka', 'Docker/K8s'],
      minYearsExperience: 4,
      educationLevel: "Bachelor's in Computer Science or equivalent practical experience",
      nigerianContextKeywords: ['Paystack', 'Flutterwave', 'Interswitch', 'NIBSS', 'CBN Regulations', 'NDPR Compliance']
    },
    candidateCount: {
      total: 184,
      screened: 184,
      shortlisted: 12,
      interviewed: 4
    }
  },
  {
    id: 'job-2',
    title: 'Growth Product Manager (Retail Banking)',
    department: 'Product & Growth',
    location: 'Lagos (Yaba / Mainland)',
    workType: 'Remote',
    salaryMinNaira: 1400000,
    salaryMaxNaira: 2200000,
    status: 'active',
    channels: ['LinkedIn', 'Telegram', 'CareersPage'],
    createdDate: '2026-08-18',
    description: 'Lead consumer user acquisition across urban Nigerian markets. Drive USSD & mobile app activation loops, agent banking penetration, and churn reduction for 2M+ active accounts.',
    requirements: {
      mustHaveSkills: ['Product Analytics', 'A/B Testing', 'USSD Channel Architecture', 'Funnel Optimization', 'SQL'],
      niceToHaveSkills: ['Mixpanel', 'Amplitude', 'PostHog', 'Agent Network Experience'],
      minYearsExperience: 3,
      educationLevel: "Bachelor's Degree",
      nigerianContextKeywords: ['Agency Banking', 'USSD *737# / *894# flows', 'Tier 1/2 KYC', 'NIBSS NIP']
    },
    candidateCount: {
      total: 96,
      screened: 96,
      shortlisted: 8,
      interviewed: 2
    }
  },
  {
    id: 'job-3',
    title: 'Frontend Engineer (React / Next.js / Mobile Web)',
    department: 'Engineering',
    location: 'Abuja (Maitama)',
    workType: 'Hybrid (Lagos)',
    salaryMinNaira: 1100000,
    salaryMaxNaira: 1750000,
    status: 'active',
    channels: ['Jobberman', 'Telegram', 'CareersPage'],
    createdDate: '2026-08-22',
    description: 'Build lightning-fast, data-saver responsive web applications optimized for 3G/4G Nigerian mobile networks (MTN, Airtel, Glo) with offline service-worker caching.',
    requirements: {
      mustHaveSkills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Web Performance Optimization'],
      niceToHaveSkills: ['PWA', 'Workbox', 'Framer Motion', 'GraphQL'],
      minYearsExperience: 3,
      educationLevel: "Bachelor's Degree",
      nigerianContextKeywords: ['Low Bandwidth Optimization', 'Mobile-first Africa', 'PWA Offline Sync']
    },
    candidateCount: {
      total: 142,
      screened: 142,
      shortlisted: 9,
      interviewed: 3
    }
  },
  {
    id: 'job-4',
    title: 'Financial Controller & Tax Lead',
    department: 'Finance & Compliance',
    location: 'Lagos (Ikoyi)',
    workType: 'On-site (VI/Ikoyi)',
    salaryMinNaira: 1600000,
    salaryMaxNaira: 2500000,
    status: 'active',
    channels: ['Jobberman', 'LinkedIn', 'CareersPage'],
    createdDate: '2026-08-25',
    description: 'Manage Nigerian corporate tax filings, FIRS & LIRS audits, withholding tax, PAYE statutory deductions, and multi-currency treasury operations in compliance with Nigerian Finance Act.',
    requirements: {
      mustHaveSkills: ['ICAN / ACCA', 'FIRS / LIRS Compliance', 'Financial Modeling', 'Statutory Audit', 'ERP Systems'],
      niceToHaveSkills: ['NetSuite', 'QuickBooks', 'Treasury & FX Hedging'],
      minYearsExperience: 5,
      educationLevel: "B.Sc Accounting + ICAN Certification",
      nigerianContextKeywords: ['FIRS TaxPro Max', 'LIRS e-Tax', 'WHT Deductions', 'PAYE', 'PITA']
    },
    candidateCount: {
      total: 62,
      screened: 62,
      shortlisted: 5,
      interviewed: 1
    }
  }
];

export const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 'cand-1',
    name: 'Chinedu Okafor',
    email: 'chinedu.okafor.dev@gmail.com',
    phone: '+234 803 451 9820',
    location: 'Lagos (Yaba)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    roleApplied: 'Senior Backend Engineer (Node.js/Fintech)',
    jobId: 'job-1',
    appliedDate: '2026-08-26',
    stage: 'interview',
    aiScore: 91,
    inflationRisk: 'low',
    yearsOfExperience: 5,
    skills: ['Node.js', 'TypeScript', 'PostgreSQL', 'Redis', 'Paystack API', 'Idempotency', 'Docker'],
    education: 'B.Eng Computer Engineering, University of Lagos (UNILAG)',
    rawCvText: `CHINEDU OKAFOR
Lagos, Nigeria | +234 803 451 9820 | github.com/chinedu-okafor

EXPERIENCE
Senior Backend Engineer — Kuda Microfinance Bank (2023 - Present)
- Engineered high-throughput ledger reconciliation service handling 450,000+ daily NIP transactions.
- Reduced failed webhook retries by 34% by implementing exponential backoff with Redis idempotency keys.
- Led migration of 14 monolithic microservices to containerized Docker services on AWS ECS.

Backend Engineer — Paystack / Stripe Africa (2021 - 2023)
- Built automated settlement batching pipelines for 8,000+ Nigerian merchants.
- Integrated CBN eNaira API endpoints and automated NIBSS direct debit flows.

EDUCATION
University of Lagos (UNILAG) — B.Eng Computer Engineering (First Class Honours, 2020)`,
    report: {
      overallScore: 91,
      technicalCompetency: 94,
      domainRelevance: 95,
      experienceAuthenticity: 90,
      cultureFitSignals: ['Demonstrated ownership at Kuda', 'Clear metrics with verifiable scale', 'Deep understanding of Nigerian settlement quirks'],
      strengths: [
        'Extensive production experience handling high-volume NIBSS and Paystack settlement pipelines',
        'Rock-solid understanding of distributed locking and Redis-backed idempotency',
        'Verifiable First Class degree from UNILAG with active GitHub commit history'
      ],
      weaknesses: [
        'Limited direct Kafka cluster administration experience (mostly used Redis Pub/Sub & RabbitMQ)',
        'Salary expectation is at upper 90th percentile of Lagos tech band'
      ],
      inflationRisk: 'low',
      inflationFlags: [],
      salaryExpectation: {
        claimed: '₦2,500,000 / month',
        marketBenchmark: '₦2,200,000 - ₦2,800,000',
        assessment: 'aligned'
      },
      recommendation: 'strong_hire',
      summaryReasoning: 'Top tier candidate with proven track record across Kuda and Paystack. CV claims are backed by specific architecture metrics and realistic Nigerian banking integration nuances.',
      developmentalFeedback: 'To transition into Principal/Staff level, consider gaining hands-on experience with multi-region database replication and deeper Kafka event sourcing patterns.'
    },
    assessmentResult: {
      score: 95,
      completedAt: '2026-08-27',
      passed: true,
      feedback: 'Flawlessly implemented idempotent Paystack webhook verification with replay protection.'
    },
    interviewNotes: {
      interviewer: 'Tola Adebisi (VP Engineering)',
      date: '2026-08-28',
      rating: 4.8,
      copilotQuestionsUsed: [
        'How did you prevent race conditions during concurrent NIBSS webhook deliveries at Kuda?',
        'Describe how you handled CBN regulatory downtime without dropping customer transactions.'
      ],
      notes: 'Articulate, humble, deeply technical. Solved distributed locking scenario effortlessly. Recommended for immediate offer.'
    },
    referenceStatus: 'completed',
    offerStatus: 'draft',
    offerAmountNaira: 2600000
  },
  {
    id: 'cand-2',
    name: 'Babatunde Adeleke',
    email: 'babatunde.adeleke99@yahoo.com',
    phone: '+234 812 390 1144',
    location: 'Lagos (Ikeja)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    roleApplied: 'Senior Backend Engineer (Node.js/Fintech)',
    jobId: 'job-1',
    appliedDate: '2026-08-25',
    stage: 'screened',
    aiScore: 64,
    inflationRisk: 'high',
    yearsOfExperience: 6,
    skills: ['Node.js', 'React', 'MongoDB', 'Python', 'AWS', 'Kubernetes', 'Cybersecurity', 'Solidity', 'AI/ML'],
    education: 'B.Sc Computer Science, Covenant University',
    rawCvText: `BABATUNDE ADELEKE
Senior Full Stack & AI Architect | Ex-Silicon Valley Consultant
Email: babatunde.adeleke99@yahoo.com

SUMMARY
World-class senior software architect with 6+ years mastering Node.js, Next.js, Kubernetes, Machine Learning, Web3, and High Frequency Trading systems. Architected solutions for Fortune 500 companies.

EXPERIENCE
Principal Architect & CTO — Zenith Ventures Global (2022 - Present)
- Single-handedly built and managed complete banking infrastructure for 10M+ users across Africa.
- Supervised 35 senior engineers in Nigeria, US, and UK.
- Implemented state-of-the-art AI payment routing achieving 99.999% uptime.

Lead Backend Consultant — Freelance / Upwork (2020 - 2022)
- Built 40+ fintech apps, e-commerce stores, and smart contracts using Node.js, Express, MongoDB.

EDUCATION
Covenant University — B.Sc Computer Science (2020)`,
    report: {
      overallScore: 64,
      technicalCompetency: 62,
      domainRelevance: 68,
      experienceAuthenticity: 38,
      cultureFitSignals: ['Over-promising and exaggerated individual impact', 'Vague corporate footprint'],
      strengths: [
        'Good fundamental grasp of basic Node.js and Express REST syntax',
        'Energetic and eager to tackle multiple domains'
      ],
      weaknesses: [
        'CV shows heavy inflation: graduated in 2020 yet claims 6+ years as "Principal Architect & CTO" managing 35 engineers',
        'Claims to have single-handedly built banking infra for 10M users for an unverifiable company entity (Zenith Ventures Global)',
        'Lists 18 disparate technologies (Web3, AI, Solidity, Kubernetes, Node) without depth in core distributed databases'
      ],
      inflationRisk: 'high',
      inflationFlags: [
        {
          id: 'flag-1',
          claim: 'Principal Architect & CTO managing 35 engineers since 2022 after 2020 graduation',
          verdict: 'Unrealistic Seniority Velocity',
          severity: 'high',
          explanation: 'Timeline shows rapid elevation to CTO managing 35 staff with only 2 years post-NYSC experience.',
          probingQuestion: 'Can you describe the organizational hierarchy, sprint cadences, and budget ownership of your 35 engineers?'
        },
        {
          id: 'flag-2',
          claim: 'Built banking infrastructure for 10M+ users single-handedly',
          verdict: 'Severe Metric Inflation',
          severity: 'critical',
          explanation: 'No registered entity with 10M African users under Zenith Ventures Global found in Nigerian CAC/CBN records.',
          probingQuestion: 'What specific database sharding strategy and CBN compliance sandbox did you use to service 10M accounts?'
        }
      ],
      salaryExpectation: {
        claimed: '₦4,500,000 / month',
        marketBenchmark: '₦1,800,000 - ₦2,400,000',
        assessment: 'unrealistic'
      },
      recommendation: 'borderline',
      summaryReasoning: 'Candidate has decent mid-level coding ability but CV exhibits classic Nigerian CV inflation patterns (CTO claims, exaggerated user scale, generic buzzword stuffing). Requires rigorous technical assessment before any live interview.',
      developmentalFeedback: 'Focus on authentic project descriptions. Highlight specific technical contributions rather than inflated team sizes and unsupported user numbers. Nigerian hiring managers value real, reproducible engineering challenges over grandiose titles.'
    }
  },
  {
    id: 'cand-3',
    name: 'Ngozi Eze',
    email: 'ngozi.eze.pm@gmail.com',
    phone: '+234 802 884 5519',
    location: 'Lagos (Lekki Phase 1)',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    roleApplied: 'Growth Product Manager (Retail Banking)',
    jobId: 'job-2',
    appliedDate: '2026-08-24',
    stage: 'assessment',
    aiScore: 88,
    inflationRisk: 'low',
    yearsOfExperience: 4,
    skills: ['Product Analytics', 'SQL', 'A/B Testing', 'USSD Product Design', 'Mixpanel', 'Figma'],
    education: 'B.Sc Economics, University of Nigeria, Nsukka (UNN)',
    rawCvText: `NGOZI EZE
Product Manager | Retail Banking & Financial Inclusion
Lagos, Nigeria | linkedin.com/in/ngozi-eze

EXPERIENCE
Product Manager (Growth & USSD) — Moniepoint Inc. (2023 - Present)
- Led the redesign of agent USSD banking journey, reducing drop-off rates from 42% to 18% across 12 Northern states.
- Collaborated with Telco aggregators (MTN/Airtel) to resolve session timeout failures during peak market hours.
- Grew weekly active merchants by 65,000 using targeted SMS nudge automations.

Associate PM — PiggyVest (2021 - 2023)
- Shipped automated savings target gamification feature adopted by 320k active users.
- Built SQL dashboards in Metabase tracking daily cohort retention and transaction churn.

EDUCATION
University of Nigeria, Nsukka — B.Sc Economics (Second Class Upper, 2020)`,
    report: {
      overallScore: 88,
      technicalCompetency: 87,
      domainRelevance: 93,
      experienceAuthenticity: 91,
      cultureFitSignals: ['Deep empathy for grassroots Nigerian banking habits', 'Strong data-driven product rigor', 'Excellent communication'],
      strengths: [
        'Hands-on experience with Nigerian Telco USSD infrastructure bottlenecks and regional nuance',
        'Proven growth metrics at top tier Nigerian fintechs (Moniepoint, PiggyVest)',
        'Solid SQL querying ability with cohort retention analysis'
      ],
      weaknesses: [
        'Less experience with B2B corporate enterprise treasury products (strictly consumer/agent banking focused)'
      ],
      inflationRisk: 'low',
      inflationFlags: [],
      salaryExpectation: {
        claimed: '₦1,900,000 / month',
        marketBenchmark: '₦1,600,000 - ₦2,200,000',
        assessment: 'aligned'
      },
      recommendation: 'interview',
      summaryReasoning: 'Exceptional product candidate with authentic grassroots Nigerian financial inclusion experience. Metrics are credible and grounded in known Moniepoint USSD workflows.',
      developmentalFeedback: 'Broaden domain expertise into regulatory open-banking APIs and B2B treasury workflows to qualify for Group Head of Product roles.'
    }
  },
  {
    id: 'cand-4',
    name: 'Fatima Aliyu',
    email: 'fatima.aliyu.tech@outlook.com',
    phone: '+234 814 552 7701',
    location: 'Abuja (Gwarinpa)',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    roleApplied: 'Frontend Engineer (React / Next.js / Mobile Web)',
    jobId: 'job-3',
    appliedDate: '2026-08-25',
    stage: 'offer',
    aiScore: 93,
    inflationRisk: 'low',
    yearsOfExperience: 3,
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'PWA', 'Performance Optimization', 'Jest'],
    education: 'B.Sc Software Engineering, Nile University of Nigeria',
    rawCvText: `FATIMA ALIYU
Abuja, Nigeria | github.com/fatima-aliyu | fatima.codes

EXPERIENCE
Frontend Engineer — Eden Life Nigeria (2023 - Present)
- Rebuilt customer ordering PWA, slashing first contentful paint (FCP) from 4.2s to 0.9s on 3G connections.
- Implemented offline-first service worker caching for pantry tracking, preserving user carts during network blackouts.
- Created reusable Design System component library in Tailwind CSS with 100% WCAG AA compliance.

Junior Frontend Developer — Helium Health (2022 - 2023)
- Developed electronic medical record (EMR) UI modules used by 80+ clinics across West Africa.

EDUCATION
Nile University of Nigeria — B.Sc Software Engineering (2022)`,
    report: {
      overallScore: 93,
      technicalCompetency: 95,
      domainRelevance: 92,
      experienceAuthenticity: 94,
      cultureFitSignals: ['Obsession with mobile web performance in low-connectivity environments', 'Clean modular code craftsmanship'],
      strengths: [
        'Mastery of Next.js 14+ app router, bundle splitting, and image optimization for African mobile bandwidth',
        'Active open-source contributor with polished live portfolio (fatima.codes)',
        'Great track record at Eden Life and Helium Health'
      ],
      weaknesses: [
        'Has mostly worked in small, nimble teams; may need orientation to large cross-border sprint rituals'
      ],
      inflationRisk: 'low',
      inflationFlags: [],
      salaryExpectation: {
        claimed: '₦1,500,000 / month',
        marketBenchmark: '₦1,300,000 - ₦1,750,000',
        assessment: 'aligned'
      },
      recommendation: 'strong_hire',
      summaryReasoning: 'Top 5% frontend engineer in Nigeria. Exceptional focus on mobile performance, offline PWA mechanics, and clean TypeScript.',
      developmentalFeedback: 'Consider exploring WebAssembly for client-side cryptographic hashing or advanced canvas rendering.'
    },
    assessmentResult: {
      score: 98,
      completedAt: '2026-08-26',
      passed: true,
      feedback: 'Scored 98/100 on Nigerian low-bandwidth asset optimization and PWA service-worker cache challenge.'
    },
    interviewNotes: {
      interviewer: 'Kayode Williams (Head of Frontend)',
      date: '2026-08-27',
      rating: 5.0,
      copilotQuestionsUsed: [
        'How did you simulate 3G throttled latency during local Eden Life QA testing?',
        'Walk us through how you handled service worker update notifications without breaking active checkout sessions.'
      ],
      notes: 'Superb answers. Deep practical knowledge. Offer extended.'
    },
    referenceStatus: 'completed',
    offerStatus: 'pending_signature',
    offerAmountNaira: 1650000
  },
  {
    id: 'cand-5',
    name: 'Amina Ibrahim',
    email: 'amina.ibrahim.acc@gmail.com',
    phone: '+234 809 112 3344',
    location: 'Lagos (Victoria Island)',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    roleApplied: 'Financial Controller & Tax Lead',
    jobId: 'job-4',
    appliedDate: '2026-08-27',
    stage: 'screened',
    aiScore: 89,
    inflationRisk: 'low',
    yearsOfExperience: 6,
    skills: ['ICAN Certified', 'FIRS TaxPro Max', 'LIRS e-Tax', 'Statutory PAYE', 'PITA & CITA', 'ERP NetSuite'],
    education: 'B.Sc Accounting, University of Ibadan + ICAN Fellow',
    rawCvText: `AMINA IBRAHIM, ACA
Financial Controller | Nigerian Tax & Statutory Compliance Specialist
Lagos, Nigeria

EXPERIENCE
Senior Tax & Compliance Manager — Flutterwave (2022 - Present)
- Supervised monthly statutory filings (PAYE, WHT, VAT, NHF, NSITF, ITF) across Lagos, Abuja, and Rivers States.
- Successfully closed 3 consecutive FIRS corporate income tax audits with zero penalty assessments.
- Automated monthly payroll tax deduction calculations for 450+ full-time and contract staff in Nigeria.

Senior Auditor — KPMG Nigeria (2019 - 2022)
- Led external statutory audits for Tier 1 commercial banks and fintech entities.

CERTIFICATIONS & EDUCATION
- Institute of Chartered Accountants of Nigeria (ICAN) — Associate (2020)
- University of Ibadan — B.Sc Accounting (First Class, 2018)`,
    report: {
      overallScore: 89,
      technicalCompetency: 92,
      domainRelevance: 94,
      experienceAuthenticity: 93,
      cultureFitSignals: ['Deep familiarity with Nigerian regulatory bodies (FIRS, LIRS, SEC, CBN)', 'Impeccable audit discipline'],
      strengths: [
        'Chartered ICAN member with Big 4 (KPMG) + high-growth fintech (Flutterwave) pedigree',
        'Proven mastery of TaxPro Max, e-Tax portals, and statutory payroll deductions',
        'Zero penalty audit track record'
      ],
      weaknesses: [
        'Primarily experienced in Nigerian jurisdiction; limited exposure to US GAAP or UK HMRC cross-border withholding.'
      ],
      inflationRisk: 'low',
      inflationFlags: [],
      salaryExpectation: {
        claimed: '₦2,300,000 / month',
        marketBenchmark: '₦2,000,000 - ₦2,600,000',
        assessment: 'aligned'
      },
      recommendation: 'strong_hire',
      summaryReasoning: 'Outstanding tax and finance leader. Verifiable ICAN license, impeccable KPMG and Flutterwave compliance record.',
      developmentalFeedback: 'Acquire cross-border transfer pricing certifications to lead continent-wide pan-African expansion.'
    }
  }
];

export const SAMPLE_ASSESSMENTS: AssessmentTest[] = [
  {
    id: 'test-1',
    jobId: 'job-1',
    roleTitle: 'Senior Backend Engineer (Node.js/Fintech)',
    durationMinutes: 45,
    difficulty: 'Senior',
    description: 'Practical challenge assessing high-volume payment webhook processing, idempotency keys, and signature verification tailored to Nigerian banking infrastructure.',
    questions: [
      {
        id: 'q1',
        type: 'coding',
        title: 'Idempotent Payment Webhook Processor with Signature Verification',
        context: 'Nigerian payment gateways (Paystack, Flutterwave, Moniepoint) deliver webhooks over unreliable telecom networks. If a webhook times out, the gateway retries sending it up to 5 times. You must verify the HMAC-SHA512 signature and process the charge event exactly once.',
        prompt: 'Implement the `handlePaymentWebhook(payload, signature, secretKey, db, cache)` function ensuring:\n1. HMAC SHA-512 signature matches payload\n2. Replay attacks are blocked using an idempotency cache\n3. Account balance is incremented within an atomic transaction\n4. Returns 200 OK without processing duplicates',
        starterCode: `import crypto from 'crypto';

interface WebhookPayload {
  event: string;
  data: {
    reference: string;
    amount: number; // in Kobo (100 Kobo = 1 Naira)
    customer_email: string;
    channel: 'card' | 'bank_transfer' | 'ussd';
  };
}

export async function handlePaymentWebhook(
  rawBody: string,
  signatureHeader: string,
  secretKey: string,
  cache: { get: (k: string) => Promise<string | null>; set: (k: string, v: string, ttl: number) => Promise<void> },
  ledger: { creditAccount: (ref: string, amountKobo: number) => Promise<boolean> }
): Promise<{ statusCode: number; message: string }> {
  // 1. Verify HMAC SHA512 Signature
  const hash = crypto
    .createHmac('sha512', secretKey)
    .update(rawBody)
    .digest('hex');

  if (hash !== signatureHeader) {
    return { statusCode: 401, message: 'Invalid Webhook Signature' };
  }

  const payload: WebhookPayload = JSON.parse(rawBody);
  const ref = payload.data.reference;

  // 2. Check Idempotency Key (Cache Lock)
  const isProcessed = await cache.get(\`webhook:processed:\${ref}\`);
  if (isProcessed) {
    return { statusCode: 200, message: 'Duplicate webhook ignored' };
  }

  // 3. Atomically Credit Account Ledger
  await ledger.creditAccount(ref, payload.data.amount);

  // 4. Mark processed in Redis with 24hr TTL
  await cache.set(\`webhook:processed:\${ref}\`, 'SUCCESS', 86400);

  return { statusCode: 200, message: 'Webhook processed successfully' };
}`,
        rubric: 'Must correctly compute HMAC SHA512, safely deserialize JSON, check cache before DB write, and return HTTP 200 for idempotency.'
      },
      {
        id: 'q2',
        type: 'situational_scenario',
        title: 'NIBSS NIP Midnight Settlement Glitch & Reconciliation',
        context: 'At 11:58 PM on Friday, NIBSS switches experience a 12-minute packet drop. 1,420 customer bank transfers show as "Pending" on your platform, but customer debit alerts have already been triggered by Zenith and GTBank.',
        prompt: 'Outline your step-by-step automated query & reconciliation workflow to resolve the 1,420 pending transfers by 6:00 AM Saturday morning without causing double credit or customer support escalation.',
        rubric: 'Must mention automated TSQ (Transaction Status Query) polling with exponential backoff, locking transaction rows with SELECT FOR UPDATE, avoiding manual refunds before NIBSS settlement log confirmation, and sending proactive customer SMS notifications.'
      },
      {
        id: 'q3',
        type: 'multiple_choice',
        title: 'Sub-second Distributed Locking for Nigerian Flash Sales',
        context: 'During a Lagos Black Friday flash sale, 10,000 concurrent requests attempt to purchase 50 discounted smartphones priced in Naira.',
        prompt: 'Which distributed locking pattern is most resilient against race conditions when using Redis in a multi-instance Node.js cluster?',
        options: [
          'A. Using standard JavaScript `async/await` with memory mutex in the master process',
          'B. Redis `SET resource_name my_random_value NX PX 30000` with Lua script unlock check',
          'C. Querying SQL `SELECT count(*) FROM orders` before each insert without row locks',
          'D. Setting a setTimeout delay of 50ms before writing to the database'
        ],
        correctOptionIndex: 1,
        rubric: 'Option B is the correct Redlock atomic primitive pattern.'
      }
    ]
  },
  {
    id: 'test-2',
    jobId: 'job-3',
    roleTitle: 'Frontend Engineer (React / Next.js / Mobile Web)',
    durationMinutes: 35,
    difficulty: 'Mid-Level',
    description: 'Evaluates responsive frontend engineering, bandwidth throttling considerations, and Next.js performance on African mobile connections.',
    questions: [
      {
        id: 'q1-fe',
        type: 'multiple_choice',
        title: 'Optimizing First Load on Nigerian 3G Mobile Networks',
        context: 'Over 65% of Nigerian mobile internet users experience fluctuating 3G connections (500kbps - 1.5Mbps) with 200ms+ round-trip latency.',
        prompt: 'Which strategy yields the highest reduction in Time to Interactive (TTI) for a Next.js 14+ client-facing application?',
        options: [
          'A. Loading all external analytics scripts synchronously in the `<head>` tag',
          'B. Dynamic imports (`next/dynamic`) for below-the-fold components and modern AVIF/WebP image formats with `next/image` sizes',
          'C. Inlining 4MB of base64 PNG images directly inside the bundle',
          'D. Polling the server every 500ms using setInterval'
        ],
        correctOptionIndex: 1,
        rubric: 'Dynamic imports with Next.js image optimization prevents massive JS bundles from blocking low-bandwidth mobile connections.'
      }
    ]
  }
];

export const SALARY_BENCHMARKS: SalaryBenchmark[] = [
  {
    role: 'Senior Backend Engineer (Node/Go/Python)',
    seniority: 'Senior',
    location: 'Lagos (Island/VI)',
    industry: 'Fintech',
    currency: 'NGN',
    minMonthlyNaira: 1900000,
    medianMonthlyNaira: 2400000,
    maxMonthlyNaira: 3200000,
    annualNairaRange: '₦22.8M - ₦38.4M',
    usdEquivalentMonthly: '$1,200 - $2,000 / mo',
    marketTrend: 'rising',
    inflationAdjustedNote: 'Fintechs frequently offer USD-pegged salary cushions or quarterly FX reviews to mitigate Naira inflation.'
  },
  {
    role: 'Senior Backend Engineer (Node/Go/Python)',
    seniority: 'Senior',
    location: 'Lagos (Mainland/Yaba)',
    industry: 'General Tech',
    currency: 'NGN',
    minMonthlyNaira: 1400000,
    medianMonthlyNaira: 1850000,
    maxMonthlyNaira: 2300000,
    annualNairaRange: '₦16.8M - ₦27.6M',
    usdEquivalentMonthly: '$900 - $1,450 / mo',
    marketTrend: 'stable',
    inflationAdjustedNote: 'Mainland startups provide hybrid flexibility and transport stipends.'
  },
  {
    role: 'Growth Product Manager',
    seniority: 'Mid',
    location: 'Lagos (Island/VI)',
    industry: 'Fintech',
    currency: 'NGN',
    minMonthlyNaira: 1500000,
    medianMonthlyNaira: 1950000,
    maxMonthlyNaira: 2500000,
    annualNairaRange: '₦18M - ₦30M',
    usdEquivalentMonthly: '$950 - $1,600 / mo',
    marketTrend: 'rising',
    inflationAdjustedNote: 'High demand driven by agency banking and digital lending expansion.'
  },
  {
    role: 'Frontend Engineer (React/Next.js)',
    seniority: 'Mid',
    location: 'Abuja',
    industry: 'Agritech/Healthtech',
    currency: 'NGN',
    minMonthlyNaira: 1100000,
    medianMonthlyNaira: 1450000,
    maxMonthlyNaira: 1800000,
    annualNairaRange: '₦13.2M - ₦21.6M',
    usdEquivalentMonthly: '$700 - $1,150 / mo',
    marketTrend: 'stable',
    inflationAdjustedNote: 'Abuja market offers lower cost of living compared to Lagos Island.'
  },
  {
    role: 'DevOps & Cloud Engineer (AWS/K8s)',
    seniority: 'Senior',
    location: 'Remote Nigeria',
    industry: 'Fintech',
    currency: 'NGN',
    minMonthlyNaira: 2200000,
    medianMonthlyNaira: 2800000,
    maxMonthlyNaira: 3800000,
    annualNairaRange: '₦26.4M - ₦45.6M',
    usdEquivalentMonthly: '$1,400 - $2,400 / mo',
    marketTrend: 'competitive',
    inflationAdjustedNote: 'Severely competitive as senior DevOps engineers are recruited by global remote firms.'
  }
];

export const SAMPLE_OFFER: OfferLetterDetails = {
  candidateId: 'cand-4',
  candidateName: 'Fatima Aliyu',
  jobTitle: 'Frontend Engineer (React / Next.js / Mobile Web)',
  department: 'Engineering',
  startDate: '2026-10-01',
  grossMonthlySalaryNaira: 1650000,
  annualSalaryNaira: 19800000,
  deductions: {
    payeTaxNaira: 215400,
    pensionContributionNaira: 132000, // 8% statutory
    nhfNaira: 41250, // 2.5% basic
    netMonthlyTakeHomeNaira: 1261350
  },
  benefits: [
    'Comprehensive HMO Health Insurance with AXA Mansard (Gold Plan including dental & optical)',
    '₦150,000 monthly remote workspace & Starlink internet power stipend',
    '₦600,000 annual continuous learning & international conference budget',
    '22 working days paid annual leave + public holidays',
    'Brand new M3 Pro MacBook Pro provided upon onboarding'
  ],
  probationMonths: 3,
  signingBonusNaira: 500000,
  status: 'pending_signature'
};
