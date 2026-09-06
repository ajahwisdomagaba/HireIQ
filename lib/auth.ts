import { cookies, headers } from 'next/headers';
import { prisma } from './prisma';
import { AppError } from './errors';
import { AccountRole } from '@prisma/client';

export interface AuthSession {
  userId: string;
  email: string;
  role: AccountRole;
  companyId: string;
}

export async function requireAuth(allowedRoles?: AccountRole[]): Promise<AuthSession> {
  const cookieStore = cookies();
  const token = cookieStore.get('hireiq_session')?.value || headers().get('authorization')?.replace('Bearer ', '');

  // 1. Authenticated User flow
  if (token) {
    const user = await prisma.user.findFirst({
      where: { id: token },
      select: {
        id: true,
        email: true,
        role: true,
        recruiterProfile: {
          select: { companyId: true },
        },
      },
    });

    if (user && user.recruiterProfile?.companyId) {
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        throw new AppError('Forbidden: Insufficient privileges', 403);
      }
      return {
        userId: user.id,
        email: user.email,
        role: user.role,
        companyId: user.recruiterProfile.companyId,
      };
    }
  }

  // 2. Development mode fallback: grab the first recruiter with a company profile
  if (process.env.NODE_ENV === 'development') {
    const devRecruiter = await prisma.user.findFirst({
      where: {
        role: { in: [AccountRole.RECRUITER, AccountRole.COMPANY_ADMIN] },
        recruiterProfile: {
          isNot: null,
        },
      },
      select: {
        id: true,
        email: true,
        role: true,
        recruiterProfile: {
          select: { companyId: true },
        },
      },
    });

    if (devRecruiter && devRecruiter.recruiterProfile?.companyId) {
      return {
        userId: devRecruiter.id,
        email: devRecruiter.email,
        role: devRecruiter.role,
        companyId: devRecruiter.recruiterProfile.companyId,
      };
    }

    // Fallback: If no recruiter profile exists yet, pick the first company
    const firstCompany = await prisma.company.findFirst({
      select: { id: true },
    });

    if (firstCompany) {
      return {
        userId: 'dev-recruiter-bypass',
        email: 'recruiter@hireiq.internal',
        role: AccountRole.RECRUITER,
        companyId: firstCompany.id,
      };
    }
  }

  throw new AppError('Authentication required to access this resource', 401);
}