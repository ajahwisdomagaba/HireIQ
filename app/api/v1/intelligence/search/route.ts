import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { handleApiError, AppError } from '@/lib/errors';
import { requireAuth } from '@/lib/auth';
import { searchHiringMemory } from '@/lib/ai/vector-search';
import { AccountRole } from '@prisma/client';

const QuerySchema = z.object({
  query: z.string().min(3),
  limit: z.coerce.number().optional().default(5),
  threshold: z.coerce.number().optional().default(0.6),
});

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth([AccountRole.RECRUITER, AccountRole.COMPANY_ADMIN]);

    if (!session.companyId) {
      throw new AppError('User is not associated with an active company', 400);
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query') ?? '';
    const limit = searchParams.get('limit') ?? '5';
    const threshold = searchParams.get('threshold') ?? '0.6';

    const validated = QuerySchema.parse({ query, limit, threshold });

    const matches = await searchHiringMemory({
      companyId: session.companyId,
      query: validated.query,
      limit: validated.limit,
      threshold: validated.threshold,
    });

    return NextResponse.json({
      query: validated.query,
      matchCount: matches.length,
      matches,
    });
  } catch (err) {
    return handleApiError(err);
  }
}