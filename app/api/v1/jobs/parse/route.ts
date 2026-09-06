import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, AppError } from '@/lib/errors';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rawDescription } = body;

    if (!rawDescription || typeof rawDescription !== 'string' || rawDescription.trim().length < 10) {
      throw new AppError('Job description must be at least 10 characters', 400);
    }

    const lower = rawDescription.toLowerCase();

    // 1. Context-aware extraction from the user's actual prompt
    const isJunior = /junior|entry|intern|0-2|graduate/i.test(lower);
    const isLead = /lead|principal|staff|head/i.test(lower);
    const isSenior = /senior|sr\.|5\+|6\+/i.test(lower) && !isJunior;

    const detectedLevel = isLead ? 'LEAD' : isSenior ? 'SENIOR' : isJunior ? 'ENTRY' : 'MID';

    // Extract title from prompt
    let detectedTitle = 'Software Engineer';
    if (/backend/i.test(lower)) detectedTitle = isJunior ? 'Junior Backend Engineer' : isSenior ? 'Senior Backend Engineer' : 'Backend Engineer';
    else if (/frontend/i.test(lower)) detectedTitle = isJunior ? 'Junior Frontend Engineer' : isSenior ? 'Senior Frontend Engineer' : 'Frontend Engineer';
    else if (/full[- ]?stack/i.test(lower)) detectedTitle = isJunior ? 'Junior Full-Stack Engineer' : isSenior ? 'Senior Full-Stack Engineer' : 'Full-Stack Engineer';
    else if (/devops|platform|cloud/i.test(lower)) detectedTitle = 'DevOps / Platform Engineer';

    // Calibrated Nigerian market compensation (Monthly NGN)
    const salaryRanges: Record<string, { min: number; max: number }> = {
      ENTRY: { min: 350000, max: 700000 },
      MID: { min: 750000, max: 1500000 },
      SENIOR: { min: 1800000, max: 3200000 },
      LEAD: { min: 3000000, max: 5500000 },
    };

    // Extract skills mentioned in the prompt
    const knownSkills = ['Node.js', 'TypeScript', 'JavaScript', 'Express', 'PostgreSQL', 'Python', 'React', 'Next.js', 'Redis', 'Docker', 'AWS', 'MongoDB', 'Go', 'GraphQL'];
    const detectedSkills = knownSkills.filter((s) => new RegExp(`\\b${s.replace('.', '\\.')}\\b`, 'i').test(rawDescription));

    let parsedData = {
      title: detectedTitle,
      department: 'Engineering',
      experienceLevel: detectedLevel,
      location: 'Lagos, Nigeria (Hybrid)',
      salaryMin: salaryRanges[detectedLevel].min,
      salaryMax: salaryRanges[detectedLevel].max,
      skills: detectedSkills.length > 0 ? detectedSkills : ['TypeScript', 'Node.js'],
    };

    // 2. Query Qorebit Gateway if available
    const qorebitApiKey = process.env.QOREBIT_API_KEY || process.env.AI_GATEWAY_KEY;
    const qorebitBaseUrl = process.env.QOREBIT_BASE_URL || 'https://api.qorebit.com/v1';

    if (qorebitApiKey) {
      try {
        const response = await fetch(`${qorebitBaseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${qorebitApiKey}`,
          },
          body: JSON.stringify({
            model: process.env.QOREBIT_MODEL || 'qorebit-intelligence-v1',
            temperature: 0.1,
            response_format: { type: 'json_object' },
            messages: [
              {
                role: 'system',
                content:
                  'You are an expert technical recruiter calibrating hiring requirements for the Nigerian tech ecosystem. Return ONLY valid JSON with keys: title, department, experienceLevel (ENTRY|MID|SENIOR|LEAD), location, salaryMin (monthly NGN number), salaryMax (monthly NGN number), skills (string array).',
              },
              {
                role: 'user',
                content: `Extract requirements from this exact input: "${rawDescription}"`,
              },
            ],
          }),
        });

        if (response.ok) {
          const resData = await response.json();
          const content = resData.choices?.[0]?.message?.content?.trim() || '';
          const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
          const json = JSON.parse(cleaned);
          parsedData = { ...parsedData, ...json };
        } else {
          console.warn('Qorebit HTTP error status:', response.status, await response.text());
        }
      } catch (gatewayErr) {
        console.warn('Qorebit network call error:', gatewayErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: parsedData,
    });
  } catch (err) {
    return handleApiError(err);
  }
}