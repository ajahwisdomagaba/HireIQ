import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import * as bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { handleApiError, AppError } from '@/lib/errors';
import { signJwtToken } from '@/lib/auth';
import { AccountRole } from '@prisma/client';

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  role: z.enum(['RECRUITER', 'CANDIDATE']),
  companyName: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = RegisterSchema.parse(body);

    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new AppError('An account with this email already exists', 409, 'USER_EXISTS');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const { user, companyId, profileId } = await prisma.$transaction(async (tx) => {
      let createdCompanyId: string | null = null;

      if (data.role === 'RECRUITER') {
        const company = await tx.company.create({
          data: {
            name: data.companyName || `${data.name}'s Organization`,
            slug: `${(data.companyName || data.name).toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
            industry: 'Technology',
          },
        });
        createdCompanyId = company.id;
      }

      const newUser = await tx.user.create({
        data: {
          email: data.email,
          name: data.name,
          passwordHash,
          role: data.role as AccountRole,
        },
      });

      let createdProfileId: string;

      if (data.role === 'RECRUITER' && createdCompanyId) {
        const recruiterProfile = await tx.recruiterProfile.create({
          data: {
            userId: newUser.id,
            companyId: createdCompanyId,
            title: 'Hiring Lead',
          },
        });
        createdProfileId = recruiterProfile.id;
      } else {
        const candidateProfile = await tx.candidateProfile.create({
          data: {
            userId: newUser.id,
          },
        });
        createdProfileId = candidateProfile.id;
      }

      return {
        user: newUser,
        companyId: createdCompanyId,
        profileId: createdProfileId,
      };
    });

    const token = signJwtToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId,
      profileId,
    });

    const response = NextResponse.json({
      message: 'Account created successfully',
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