import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { logger } from './logger';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public code: string = 'BAD_REQUEST',
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    logger.warn({ err: error, code: error.code }, error.message);
    return NextResponse.json(
      { error: error.message, code: error.code, details: error.details },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    logger.warn({ issues: error.issues }, 'Validation Error');
    return NextResponse.json(
      { error: 'Invalid input payload', code: 'VALIDATION_ERROR', details: error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  logger.error({ err: error }, 'Unhandled Server Error');
  return NextResponse.json(
    { error: 'An unexpected internal error occurred', code: 'INTERNAL_SERVER_ERROR' },
    { status: 500 }
  );
}