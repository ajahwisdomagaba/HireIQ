import { executeAIGateway } from './gateway';

export interface AssessmentGradingResult {
  overallScore: number; // 0 - 100
  passed: boolean;
  codeQualityRating: 'EXCELLENT' | 'ADEQUATE' | 'DEFICIENT';
  timeComplexity: string;
  spaceComplexity: string;
  rubricBreakdown: {
    criterion: string;
    awardedPoints: number;
    maxPoints: number;
    feedback: string;
  }[];
  aiAssistanceLikelihood: 'LOW' | 'SUSPECTED' | 'HIGH';
  plagiarismNotes?: string;
  detailedFeedback: string;
}

export async function gradeAssessmentSubmission(params: {
  problemStatement: string;
  candidateCode: string;
  language: string;
  timeTakenMinutes: number;
}): Promise<{ grading: AssessmentGradingResult; aiRunId: string }> {
  const systemPrompt = `You are an automated Senior Staff Engineer Code Reviewer and Plagiarism Inspector.
Grade the candidate's submitted solution against the problem statement for correctness, clean architecture, edge-case resilience, and hallmarks of raw copy-pasted LLM boilerplate.`;

  const userPrompt = `Problem Statement:
"""
${params.problemStatement}
"""

Candidate Submitted Solution (${params.language}):
"""
${params.candidateCode}
"""
Time Taken: ${params.timeTakenMinutes} minutes

Evaluate correctness, compute the score (0-100), analyze Big-O complexity, and check for signs of AI assistance.`;

  const schemaDescription = `{
  "overallScore": number,
  "passed": boolean,
  "codeQualityRating": "EXCELLENT" | "ADEQUATE" | "DEFICIENT",
  "timeComplexity": string,
  "spaceComplexity": string,
  "rubricBreakdown": [
    {
      "criterion": string,
      "awardedPoints": number,
      "maxPoints": number,
      "feedback": string
    }
  ],
  "aiAssistanceLikelihood": "LOW" | "SUSPECTED" | "HIGH",
  "plagiarismNotes": string,
  "detailedFeedback": string
}`;

  const result = await executeAIGateway<AssessmentGradingResult>({
    agentName: 'AssessmentGradingAgent',
    promptVersion: '1.0.0',
    systemPrompt,
    userPrompt,
    schemaDescription,
  });

  return { grading: result.data, aiRunId: result.aiRunId };
}