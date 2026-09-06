import { NextRequest, NextResponse } from 'next/server';
import { executeAIGateway } from '@/lib/ai/gateway';

export async function POST(req: NextRequest) {
  try {
    const { candidateClaim, jobContext, interviewStage } = await req.json();

    if (!candidateClaim?.trim()) {
      return NextResponse.json({ error: 'Candidate statement required' }, { status: 400 });
    }

    const systemPrompt = `You are an elite Technical Interview Co-Pilot assisting a recruiter in real-time.
Your goal is to cut through buzzwords and verify authentic hands-on execution versus inflated claims.
Focus on Nigerian and global corporate/tech engineering standards. Keep answers sharp, direct, and conversational.`;

    const userPrompt = `Role Context: ${jobContext || 'Senior Backend Engineer'}
Interview Stage: ${interviewStage || 'TECHNICAL'}
Candidate Statement: "${candidateClaim}"

Provide:
1. 💡 Two sharp, probing follow-up questions to test if they actually built this.
2. 🎯 One signal note (Green Flag or Exaggeration Alert).

Format output directly:
💡 **Probing Question 1:** <Question>

💡 **Probing Question 2:** <Question>

🎯 **Verification Cue:** <What specific details to listen for in their answer>`;

    const result = await executeAIGateway<string>({
      agentName: 'InterviewCopilotAgent',
      systemPrompt,
      userPrompt,
      model: 'claude-sonnet-4-5-20250929',
      temperature: 0.2,
    });

    return NextResponse.json({ text: result.data });
  } catch (error: any) {
    console.error('Co-Pilot Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate co-pilot guidance' },
      { status: 500 }
    );
  }
}