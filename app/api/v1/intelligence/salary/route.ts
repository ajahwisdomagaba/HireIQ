import { NextRequest, NextResponse } from 'next/server';
import { calculateSalaryIntelligence } from '@/lib/salary/intelligence';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roleTitle = searchParams.get('role') || 'Senior Backend Engineer';
    const location = searchParams.get('location') || 'island';
    const industry = searchParams.get('industry') || 'fintech';
    const experienceYears = Number(searchParams.get('exp') || 5);
    const nafemFxRate = Number(searchParams.get('fx') || 1450);

    const data = await calculateSalaryIntelligence({
      roleTitle,
      location,
      industry,
      experienceYears,
      nafemFxRate,
    });

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to compute salary benchmarks' },
      { status: 500 }
    );
  }
}