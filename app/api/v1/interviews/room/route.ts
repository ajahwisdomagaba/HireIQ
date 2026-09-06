import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { handleApiError, AppError } from '@/lib/errors';
import { requireAuth } from '@/lib/auth';
import { env } from '@/lib/env';
import { AccountRole } from '@prisma/client';

const CreateRoomSchema = z.object({
  applicationId: z.string().min(1),
  stage: z.enum(['HR_SCREEN', 'TECHNICAL', 'MANAGEMENT', 'EXECUTIVE_FINAL']).default('TECHNICAL'),
  scheduledAt: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth([AccountRole.RECRUITER, AccountRole.COMPANY_ADMIN]);
    const body = await req.json();
    const data = CreateRoomSchema.parse(body);

    const application = await prisma.application.findUnique({
      where: { id: data.applicationId },
      include: { job: true },
    });

    if (!application || application.job.companyId !== session.companyId) {
      throw new AppError('Application not found or unauthorized', 404);
    }

    let dailyRoomUrl = `https://hireiq.daily.co/room-${Date.now()}`;

    // Provision real Daily.co room if API key is provided
    if (env.DAILY_API_KEY) {
      try {
        const dailyRes = await fetch('https://api.daily.co/v1/rooms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env.DAILY_API_KEY}`,
          },
          body: JSON.stringify({
            name: `hireiq-${application.id.slice(-8)}-${Date.now().toString().slice(-4)}`,
            properties: {
              exp: Math.floor(Date.now() / 1000) + 7200, // 2-hour room expiration
              enable_chat: true,
              enable_screenshare: true,
            },
          }),
        });

        if (dailyRes.ok) {
          const roomData = await dailyRes.json();
          dailyRoomUrl = roomData.url;
        }
      } catch (err) {
        console.error('Daily.co API call failed, using fallback URL:', err);
      }
    }

    // Get recruiter profile
    const recruiterProfile = await prisma.recruiterProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!recruiterProfile) {
      throw new AppError('Recruiter profile required to host interviews', 400);
    }

    const interview = await prisma.interview.create({
      data: {
        applicationId: application.id,
        interviewerId: recruiterProfile.id,
        stage: data.stage as any,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : new Date(),
        dailyRoomUrl,
      },
    });

    return NextResponse.json({
      message: 'Interview room provisioned successfully',
      interviewId: interview.id,
      dailyRoomUrl: interview.dailyRoomUrl,
    });
  } catch (err) {
    return handleApiError(err);
  }
}