import { executeAIGateway } from './gateway';

export interface InterviewEvaluationReport {
  overallInterviewScore: number;
  hiringVerdict: 'STRONG_HIRE' | 'INTERVIEW' | 'BORDERLINE_REVIEW' | 'REJECT';
  executiveSummary: string;
  technicalDepthScore: number;
  communicationScore: number;
  keyStrengthsObserved: string[];
  redFlagsAndInconsistencies: string[];
  suggestedSalaryBandNGN: {
    min: number;
    max: number;
  };
}

export async function generateInterviewReport(params: {
  candidateName: string;
  jobTitle: string;
  transcript: string;
  recruiterNotes: string;
  stage: string;
}): Promise<{ report: InterviewEvaluationReport; aiRunId: string }> {
  const systemPrompt = `You are an expert AI Hiring Committee Chair.
Evaluate the candidate based on the complete interview transcript, recruiter scratchpad notes, and technical rigor.
Deliver a balanced, evidence-backed evaluation report with a definitive hiring verdict.`;

  const userPrompt = `Candidate: ${params.candidateName}
Target Role: ${params.jobTitle}
Interview Stage: ${params.stage}

Recruiter Scratchpad Notes:
"""
${params.recruiterNotes || 'No additional notes provided.'}
"""

Full Interview Transcript:
"""
${params.transcript}
"""

Evaluate this candidate's performance, assess claim veracity, and provide a structured final scorecard.`;

  const schemaDescription = `{
  "overallInterviewScore": number,
  "hiringVerdict": "STRONG_HIRE" | "INTERVIEW" | "BORDERLINE_REVIEW" | "REJECT",
  "executiveSummary": string,
  "technicalDepthScore": number,
  "communicationScore": number,
  "keyStrengthsObserved": string[],
  "redFlagsAndInconsistencies": string[],
  "suggestedSalaryBandNGN": {
    "min": number,
    "max": number
  }
}`;

  const result = await executeAIGateway<InterviewEvaluationReport>({
    agentName: 'InterviewReportAgent',
    promptVersion: '1.0.0',
    systemPrompt,
    userPrompt,
    schemaDescription,
  });

  return { report: result.data, aiRunId: result.aiRunId };
}