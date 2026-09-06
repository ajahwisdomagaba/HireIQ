import { executeAIGateway } from './gateway';

export interface ScreeningEvaluation {
  overallScore: number; // 0 to 100
  verdict: 'STRONG_HIRE' | 'INTERVIEW' | 'BORDERLINE_REVIEW' | 'REJECT';
  summaryReasoning: string;
  requirementMatches: {
    requirementTitle: string;
    isMet: boolean;
    score: number; // 0 to 100
    evidenceFromCv: string;
    missingElements?: string;
  }[];
  inflationSignals: {
    claimedStatement: string;
    suspicionReason: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
  }[];
}

export async function runScreeningAgent(params: {
  jobTitle: string;
  jobDescription: string;
  requirements: { title: string; weight: number; requirementType: string; description?: string | null }[];
  candidateName: string;
  resumeText: string;
}): Promise<{ evaluation: ScreeningEvaluation; aiRunId: string }> {
  const systemPrompt = `You are an expert AI Technical Talent Screener specialized in the Nigerian corporate and tech labor market.
Your task is to critically evaluate candidate resumes against explicit job requirements with strict evidence-based verification.
Screen for authentic hands-on execution versus buzzword stuffing, inflated job titles, and unrealistic scope claims relative to career tenure.`;

  const userPrompt = `Target Job Title: ${params.jobTitle}
Job Description Overview:
${params.jobDescription}

Discrete Requirements To Score:
${JSON.stringify(params.requirements, null, 2)}

Candidate: ${params.candidateName}
Resume Content:
"""
${params.resumeText}
"""

Evaluate this candidate against every single requirement individually.
Calculate the weighted overall score (0-100) and check for CV inflation or implausible seniority claims.`;

  const schemaDescription = `{
  "overallScore": number, // 0 - 100
  "verdict": "STRONG_HIRE" | "INTERVIEW" | "BORDERLINE_REVIEW" | "REJECT",
  "summaryReasoning": string,
  "requirementMatches": [
    {
      "requirementTitle": string,
      "isMet": boolean,
      "score": number, // 0 - 100
      "evidenceFromCv": string,
      "missingElements": string // optional
    }
  ],
  "inflationSignals": [
    {
      "claimedStatement": string,
      "suspicionReason": string,
      "severity": "LOW" | "MEDIUM" | "HIGH"
    }
  ]
}`;

  const result = await executeAIGateway<ScreeningEvaluation>({
    agentName: 'ScreeningAgent',
    promptVersion: '1.0.0',
    systemPrompt,
    userPrompt,
    schemaDescription,
  });

  return { evaluation: result.data, aiRunId: result.aiRunId };
}