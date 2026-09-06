import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateCandidateReport } from '@/lib/ai';
import { RecommendationVerdict } from '@prisma/client';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const { applicationId } = await params;

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: { requirements: true },
        },
        resume: true,
        screeningSessions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    if (!application.resume?.rawText) {
      return NextResponse.json(
        { success: false, error: 'Resume raw text missing' },
        { status: 400 }
      );
    }

    const latestScreening = application.screeningSessions[0];
    const screeningReasoning = latestScreening?.summaryReasoning || 'Screening pending';

    // 1. Generate report via Qorebit AI
    const rawAiReport = (await generateCandidateReport(
      application.job.title,
      application.job.requirements,
      screeningReasoning,
      application.resume.rawText
    )) as Record<string, any>;

    // 2. Normalize and sanitize output values with fallback mappings
    const rawScore = rawAiReport.matchScore ?? rawAiReport.score ?? rawAiReport.overallScore ?? latestScreening?.overallScore ?? 70;
    const matchScore = Math.round(Number(rawScore));

    const validVerdicts = Object.values(RecommendationVerdict);
    const candidateVerdict = (rawAiReport.verdict || latestScreening?.verdict || 'BORDERLINE_REVIEW').toUpperCase();
    const verdict: RecommendationVerdict = validVerdicts.includes(candidateVerdict as RecommendationVerdict)
      ? (candidateVerdict as RecommendationVerdict)
      : RecommendationVerdict.BORDERLINE_REVIEW;

    const executiveSummary = String(
      rawAiReport.executiveSummary ||
      rawAiReport.summary ||
      screeningReasoning ||
      'Executive evaluation generated based on candidate qualifications.'
    );

    const strengths: string[] = Array.isArray(rawAiReport.strengths)
      ? rawAiReport.strengths
      : Array.isArray(rawAiReport.technicalStrengths)
      ? rawAiReport.technicalStrengths
      : ['Relevant backend engineering experience', 'Familiarity with modern stack'];

    const weaknesses: string[] = Array.isArray(rawAiReport.weaknesses)
      ? rawAiReport.weaknesses
      : Array.isArray(rawAiReport.keyRisks)
      ? rawAiReport.keyRisks
      : ['Experience duration slightly under target requisition threshold'];

    const growthRoadmap: string[] = Array.isArray(rawAiReport.growthRoadmap)
      ? rawAiReport.growthRoadmap
      : ['Query optimization deep-dive', 'System architecture review'];

    const marketSalaryBand = String(
      rawAiReport.marketSalaryBand ||
      rawAiReport.salaryBand ||
      'Competitive Market Rate'
    );

    // 3. Persist to CandidateReport
    const savedReport = await prisma.candidateReport.create({
      data: {
        applicationId,
        matchScore,
        verdict,
        executiveSummary,
        strengths,
        weaknesses,
        growthRoadmap,
        marketSalaryBand,
      },
    });

    return NextResponse.json({
      success: true,
      reportId: savedReport.id,
      report: savedReport,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}