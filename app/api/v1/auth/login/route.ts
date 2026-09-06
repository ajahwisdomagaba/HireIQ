import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import * as bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { handleApiError, AppError } from '@/lib/errors';
import { signJwtToken } from '@/lib/auth';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = LoginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        recruiterProfile: true,
        candidateProfile: true,
      },
    });

    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const companyId = user.recruiterProfile?.companyId ?? null;
    const profileId = user.recruiterProfile?.id || user.candidateProfile?.id;

    const token = signJwtToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId,
      profileId,
    });

    const response = NextResponse.json({
      message: 'Authenticated successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId,
      },
    });

    response.cookies.set('hireiq_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (err) {
    return handleApiError(err);
  }
}