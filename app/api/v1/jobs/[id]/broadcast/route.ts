import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { broadcastToTelegram, generateLinkedInSharePayload } from '@/lib/broadcast/multi-channel';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json().catch(() => ({}));
    const { channels = ['telegram', 'linkedin'] } = body;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        company: true,
      } as any,
    });

    if (!job) {
      return NextResponse.json({ error: 'Job requisition not found' }, { status: 404 });
    }

    const jobRecord = job as any;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const applyUrl = `${baseUrl}/jobs/${jobRecord.id}`;

    // Safely extract description from whatever field your schema uses
    const descriptionText =
      jobRecord.description ||
      jobRecord.contextText ||
      jobRecord.rawText ||
      `${jobRecord.title} opening at ${jobRecord.company?.name || 'HireIQ Network'}`;

    // Safely extract requirements if present
    const rawReqs = jobRecord.requirements || jobRecord.jobRequirements || [];
    const requirements: string[] = Array.isArray(rawReqs)
      ? rawReqs.map((r: any) => (typeof r === 'string' ? r : r.title || r.name || ''))
      : [];

    const jobPayload = {
      id: jobRecord.id,
      title: jobRecord.title,
      companyName: jobRecord.company?.name || 'HireIQ Network',
      location: jobRecord.location || 'Lagos, Nigeria (Hybrid / Remote)',
      employmentType: jobRecord.employmentType || 'Full-Time',
      summary: descriptionText.slice(0, 300) + '...',
      requirements,
      applyUrl,
    };

    let telegramResult: { success: boolean; messageId?: number; error?: string } = {
      success: false,
      error: 'Not selected',
    };

    if (channels.includes('telegram')) {
      telegramResult = await broadcastToTelegram(jobPayload);
    }

    const linkedin = generateLinkedInSharePayload(jobPayload);
    const jobbermanFeedUrl = `${baseUrl}/api/v1/jobs/feed/jobberman`;

    return NextResponse.json({
      success: true,
      jobId: jobRecord.id,
      telegram: telegramResult,
      linkedin,
      jobbermanFeedUrl,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Broadcasting failed' }, { status: 500 });
  }
}