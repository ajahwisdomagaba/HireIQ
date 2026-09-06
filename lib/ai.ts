import dotenv from 'dotenv';
dotenv.config();

const QOREBIT_API_KEY = process.env.QOREBIT_API_KEY;
const QOREBIT_BASE_URL = process.env.QOREBIT_BASE_URL || 'https://api.qorebit.ai/v1';

if (!QOREBIT_API_KEY) {
  throw new Error('Missing QOREBIT_API_KEY in environment variables');
}

export interface ScreeningEvaluation {
  overallScore: number;
  verdict: 'STRONG_HIRE' | 'INTERVIEW' | 'BORDERLINE_REVIEW' | 'REJECT';
  summaryReasoning: string;
  requirementMatches: {
    requirementTitle: string;
    isMet: boolean;
    score: number;
    evidenceFromCv: string;
    missingElements?: string;
  }[];
  inflationSignals: {
    claimedStatement: string;
    suspicionReason: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
  }[];
}

export interface GeneratedCandidateReport {
  matchScore: number;
  verdict: 'STRONG_HIRE' | 'INTERVIEW' | 'BORDERLINE_REVIEW' | 'REJECT';
  executiveSummary: string;
  strengths: string[];
  weaknesses: string[];
  growthRoadmap: string[];
  marketSalaryBand: string;
}

export async function generateCandidateReport(
  jobTitle: string,
  requirements: { title: string }[],
  screeningReasoning: string,
  resumeText: string
): Promise<GeneratedCandidateReport> {
  const systemPrompt = `
You are an Executive Hiring Strategist. Create a comprehensive Candidate Briefing Report for the interview committee.
Return strictly valid JSON with this exact schema:
{
  "executiveSummary": "<concise paragraph assessing role fit>",
  "technicalStrengths": ["<strength 1>", "<strength 2>"],
  "keyRisks": ["<risk/gap 1>", "<risk/gap 2>"],
  "suggestedInterviewQuestions": [
    {
      "topic": "<category>",
      "question": "<probing interview question>",
      "whatToLookFor": "<key signs of competency>"
    }
  ]
}
`;

  const userPrompt = `
Requisition: ${jobTitle}
Requirements: ${requirements.map((r) => r.title).join(', ')}
AI Screening Findings: ${screeningReasoning}

Resume:
${resumeText}
`;

  const res = await fetch(`${QOREBIT_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${QOREBIT_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'azure/gpt-4o-mini',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Qorebit Report Generation Error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return JSON.parse(data.choices[0].message.content) as GeneratedCandidateReport;
}

// Deterministic fallback vector (1536 dims standard for pgvector compatibility)
function createFallbackEmbedding(text: string, dimensions = 1536): number[] {
  const vector = new Array(dimensions).fill(0);
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    const index = (code * 31 + i) % dimensions;
    vector[index] = Number(((code % 100) / 100).toFixed(4));
  }
  return vector;
}

// 1. Embedding generator with graceful fallback
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const res = await fetch(`${QOREBIT_BASE_URL}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${QOREBIT_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      return json.data[0].embedding;
    }
  } catch {
    // Fall through to deterministic fallback if remote provider is unreachable
  }

  return createFallbackEmbedding(text);
}

// 2. Candidate Evaluation via Qorebit Chat Completion (azure/gpt-4o-mini)
export async function evaluateCandidateResume(
  jobTitle: string,
  jobDescription: string,
  requirements: { title: string; requirementType: string; description?: string | null }[],
  resumeText: string
): Promise<ScreeningEvaluation> {
  const systemPrompt = `
You are an expert ATS Evaluation AI. Analyze the candidate resume against the given requisition and requirements.
Return strictly valid JSON with this exact schema:
{
  "overallScore": <integer 0-100>,
  "verdict": "<STRONG_HIRE | INTERVIEW | BORDERLINE_REVIEW | REJECT>",
  "summaryReasoning": "<concise explanation>",
  "requirementMatches": [
    {
      "requirementTitle": "<title>",
      "isMet": <boolean>,
      "score": <integer 0-100>,
      "evidenceFromCv": "<quote or proof from cv>",
      "missingElements": "<gaps or null>"
    }
  ],
  "inflationSignals": [
    {
      "claimedStatement": "<statement>",
      "suspicionReason": "<reason>",
      "severity": "<LOW | MEDIUM | HIGH>"
    }
  ]
}
`;

  const userPrompt = `
Requisition: ${jobTitle}
Description: ${jobDescription}

Requirements:
${JSON.stringify(requirements, null, 2)}

Candidate Resume:
${resumeText}
`;

  const res = await fetch(`${QOREBIT_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${QOREBIT_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'azure/gpt-4o-mini',
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Qorebit Chat Completion Error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return JSON.parse(data.choices[0].message.content) as ScreeningEvaluation;
}