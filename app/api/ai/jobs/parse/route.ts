import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(req: NextRequest) {
  try {
    const { rawDescription, title, department } = await req.json();

    if (!rawDescription) {
      return NextResponse.json(
        { error: 'Job description content is required' },
        { status: 400 }
      );
    }

    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 2000,
      system: `You are an expert AI Talent Engineer specialized in the Nigerian corporate and tech labor market.
Your task is to analyze unstructured job descriptions and extract a strict, structured requirements model.
Always respond with valid JSON strictly matching the specified schema.`,
      messages: [
        {
          role: 'user',
          content: `Analyze this job posting:
Title Hint: ${title || 'Not specified'}
Department Hint: ${department || 'Not specified'}

Raw Description:
"""
${rawDescription}
"""

Extract and return valid JSON with this exact structure:
{
  "title": string,
  "department": string,
  "employmentType": "Full-Time" | "Part-Time" | "Contract" | "Remote",
  "experienceLevel": "Junior" | "Mid-Level" | "Senior" | "Lead",
  "location": string,
  "requiredSkills": string[],
  "preferredSkills": string[],
  "minimumYearsExperience": number,
  "educationRequirements": string,
  "salaryRangeEstimateNGN": {
    "min": number,
    "max": number
  },
  "screeningCriteria": [
    {
      "criteria": string,
      "weight": number,
      "evaluationNote": string
    }
  ],
  "nigerianMarketContextNotes": string
}`,
        },
      ],
    });

    const firstBlock = response.content[0];
    if (!firstBlock || firstBlock.type !== 'text') {
      throw new Error('Anthropic response did not return a valid text block');
    }

    // Clean potential markdown wrap if returned
    const cleanJson = firstBlock.text.replace(/```json\n?|\n?```/g, '').trim();
    const parsedData = JSON.parse(cleanJson);

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error('JD Parsing Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to parse job description' },
      { status: 500 }
    );
  }
}