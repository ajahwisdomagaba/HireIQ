import { executeAIGateway } from './gateway';

export interface GrowthRoadmap {
  executiveSummary: string;
  strengthsIdentified: string[];
  primarySkillGaps: {
    skill: string;
    gapDescription: string;
    marketContext: string;
  }[];
  actionableUpskillingRoadmap: {
    weekRange: string;
    focusArea: string;
    recommendedAction: string;
    practicalProjectIdea: string;
  }[];
  interviewReadinessScore: number; // 0 - 100
  encouragementNote: string;
}

export async function generateCandidateFeedback(params: {
  candidateName: string;
  jobTitle: string;
  companyName: string;
  resumeText: string;
  requirementMatches: {
    requirementTitle: string;
    isMet: boolean;
    missingElements?: string | null;
  }[];
}): Promise<{ roadmap: GrowthRoadmap; aiRunId: string }> {
  const systemPrompt = `You are an expert AI Career Coach and Talent Development Mentor specialized in the Nigerian corporate and tech ecosystem.
Your mission is to provide constructive, honest, and high-impact developmental feedback to a candidate who was not selected for a role.
Focus on actionable bridge projects, real engineering skills, and local market expectations (e.g., Nigerian FinTech, high-availability architecture, distributed systems).
Avoid generic fluff; give concrete technical projects and milestones.`;

  const userPrompt = `Candidate: ${params.candidateName}
Applied Role: ${params.jobTitle} at ${params.companyName}

Screening Evaluation Results & Requirement Gaps:
${JSON.stringify(params.requirementMatches, null, 2)}

Candidate Resume Extract:
"""
${params.resumeText}
"""

Generate a constructive, comprehensive growth roadmap detailing why they missed the cut, what skills to develop, and a phased project roadmap.`;

  const schemaDescription = `{
  "executiveSummary": string,
  "strengthsIdentified": string[],
  "primarySkillGaps": [
    {
      "skill": string,
      "gapDescription": string,
      "marketContext": string
    }
  ],
  "actionableUpskillingRoadmap": [
    {
      "weekRange": string,
      "focusArea": string,
      "recommendedAction": string,
      "practicalProjectIdea": string
    }
  ],
  "interviewReadinessScore": number,
  "encouragementNote": string
}`;

  const result = await executeAIGateway<GrowthRoadmap>({
    agentName: 'CandidateFeedbackAgent',
    promptVersion: '1.0.0',
    systemPrompt,
    userPrompt,
    schemaDescription,
  });

  return { roadmap: result.data, aiRunId: result.aiRunId };
}