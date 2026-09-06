export type ApplicationStage = 
  | 'sourced'
  | 'screened'
  | 'assessment'
  | 'interview'
  | 'reference'
  | 'offer'
  | 'hired'
  | 'rejected';

export type InflationRiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface InflationFlag {
  id: string;
  claim: string;
  verdict: string;
  severity: InflationRiskLevel;
  explanation: string;
  probingQuestion: string;
}

export interface CandidateReport {
  overallScore: number;
  technicalCompetency: number;
  domainRelevance: number;
  experienceAuthenticity: number;
  cultureFitSignals: string[];
  strengths: string[];
  weaknesses: string[];
  inflationRisk: InflationRiskLevel;
  inflationFlags: InflationFlag[];
  salaryExpectation: {
    claimed: string;
    marketBenchmark: string;
    assessment: 'below_market' | 'aligned' | 'above_market' | 'unrealistic';
  };
  recommendation: 'strong_hire' | 'interview' | 'borderline' | 'reject';
  summaryReasoning: string;
  developmentalFeedback: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string; // e.g. "Lagos (Yaba)", "Abuja", "Remote (Nigeria)"
  avatar: string;
  roleApplied: string;
  jobId: string;
  appliedDate: string;
  stage: ApplicationStage;
  aiScore: number;
  inflationRisk: InflationRiskLevel;
  yearsOfExperience: number;
  skills: string[];
  education: string;
  rawCvText: string;
  report?: CandidateReport;
  assessmentResult?: {
    score: number;
    completedAt: string;
    passed: boolean;
    feedback: string;
  };
  interviewNotes?: {
    interviewer: string;
    date: string;
    rating: number;
    copilotQuestionsUsed: string[];
    notes: string;
  };
  referenceStatus?: 'pending' | 'sent' | 'completed';
  offerStatus?: 'draft' | 'sent' | 'pending_signature' | 'accepted' | 'declined';
  offerAmountNaira?: number;
}

export interface JobRequirement {
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
  minYearsExperience: number;
  educationLevel: string;
  nigerianContextKeywords: string[];
}

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  workType: 'Remote' | 'Hybrid (Lagos)' | 'On-site (VI/Ikoyi)' | 'On-site (Abuja)';
  salaryMinNaira: number;
  salaryMaxNaira: number;
  status: 'active' | 'draft' | 'closed';
  channels: ('Jobberman' | 'LinkedIn' | 'Telegram' | 'CareersPage')[];
  description: string;
  requirements: JobRequirement;
  createdDate: string;
  candidateCount: {
    total: number;
    screened: number;
    shortlisted: number;
    interviewed: number;
  };
}

export interface AssessmentQuestion {
  id: string;
  type: 'multiple_choice' | 'coding' | 'situational_scenario';
  title: string;
  prompt: string;
  context: string;
  options?: string[];
  correctOptionIndex?: number;
  starterCode?: string;
  expectedOutputSnippet?: string;
  rubric: string;
}

export interface AssessmentTest {
  id: string;
  jobId: string;
  roleTitle: string;
  durationMinutes: number;
  difficulty: 'Junior' | 'Mid-Level' | 'Senior' | 'Lead';
  description: string;
  questions: AssessmentQuestion[];
}

export interface SalaryBenchmark {
  role: string;
  seniority: 'Entry' | 'Junior' | 'Mid' | 'Senior' | 'Lead/Principal';
  location: 'Lagos (Island/VI)' | 'Lagos (Mainland/Yaba)' | 'Abuja' | 'Port Harcourt' | 'Remote Nigeria';
  industry: 'Fintech' | 'E-commerce/Logistics' | 'Banking & Traditional' | 'Agritech/Healthtech' | 'General Tech';
  currency: 'NGN' | 'USD';
  minMonthlyNaira: number;
  medianMonthlyNaira: number;
  maxMonthlyNaira: number;
  annualNairaRange: string;
  usdEquivalentMonthly: string;
  marketTrend: 'rising' | 'stable' | 'competitive';
  inflationAdjustedNote: string;
}

export interface ReferenceQuestionResponse {
  refereeName: string;
  refereeRole: string;
  company: string;
  relationship: string;
  ratings: {
    technicalProficiency: number;
    reliabilityUnderPressure: number;
    integrityAndHonesty: number;
    collaboration: number;
  };
  qualitativeFeedback: string;
  wouldRehire: boolean;
}

export interface OfferLetterDetails {
  candidateId: string;
  candidateName: string;
  jobTitle: string;
  department: string;
  startDate: string;
  grossMonthlySalaryNaira: number;
  annualSalaryNaira: number;
  deductions: {
    payeTaxNaira: number;
    pensionContributionNaira: number; // 8% employee
    nhfNaira: number;
    netMonthlyTakeHomeNaira: number;
  };
  benefits: string[];
  probationMonths: number;
  signingBonusNaira?: number;
  status: 'draft' | 'pending_signature' | 'signed' | 'expired';
}

export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
}

export type ViewMode = 
  | 'dashboard'
  | 'pipeline'
  | 'live_interview'
  | 'assessments'
  | 'candidate_portal'
  | 'salary_intelligence'
  | 'offers_references'
  | 'mcp_server'
  | 'figma_design_system';
