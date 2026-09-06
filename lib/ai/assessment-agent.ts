import { executeAIGateway } from './gateway';

export interface GeneratedAssessment {
  title: string;
  problemStatement: string;
  starterCode: string;
  language: 'typescript' | 'javascript' | 'python' | 'sql';
  timeLimitMinutes: number;
  testCases: {
    input: string;
    expectedOutput: string;
    isHidden: boolean;
    description: string;
  }[];
  evaluationRubric: {
    criterion: string;
    maxPoints: number;
    description: string;
  }[];
}

export async function generatePracticalAssessment(params: {
  jobTitle: string;
  skillRequirements: string[];
  seniorityLevel: string;
}): Promise<{ assessment: GeneratedAssessment; aiRunId: string }> {
  const systemPrompt = `You are a Principal Engineering Assessor specialized in hands-on production code evaluations.
Design a realistic, high-signal coding challenge based on the specified role and skills.
Avoid generic LeetCode puzzles. Focus on practical backend scenarios (e.g., race conditions, idempotent webhook deduplication, token-bucket rate limiters, database transaction locking).`;

  const userPrompt = `Target Role: ${params.jobTitle} (${params.seniorityLevel})
Core Skills: ${params.skillRequirements.join(', ')}

Create a complete coding challenge containing starter code, public/hidden test cases, and a comprehensive scoring rubric.`;

  const schemaDescription = `{
  "title": string,
  "problemStatement": string,
  "starterCode": string,
  "language": "typescript" | "javascript" | "python" | "sql",
  "timeLimitMinutes": number,
  "testCases": [
    {
      "input": string,
      "expectedOutput": string,
      "isHidden": boolean,
      "description": string
    }
  ],
  "evaluationRubric": [
    {
      "criterion": string,
      "maxPoints": number,
      "description": string
    }
  ]
}`;

  const result = await executeAIGateway<GeneratedAssessment>({
    agentName: 'AssessmentGeneratorAgent',
    promptVersion: '1.0.0',
    systemPrompt,
    userPrompt,
    schemaDescription,
  });

  return { assessment: result.data, aiRunId: result.aiRunId };
}