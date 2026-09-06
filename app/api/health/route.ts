import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Redis from 'ioredis';
import { env } from '@/lib/env';

export async function GET() {
  const status: Record<string, string> = {
    app: 'healthy',
    database: 'unknown',
    redis: 'unknown',
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    status.database = 'connected';
  } catch (error) {
    status.database = 'disconnected';
  }

  try {
    const redis = new Redis(env.REDIS_URL, { connectTimeout: 2000, maxRetriesPerRequest: 1 });
    const pong = await redis.ping();
    status.redis = pong === 'PONG' ? 'connected' : 'disconnected';
    redis.disconnect();
  } catch (error) {
    status.redis = 'disconnected';
  }

  const isHealthy = status.database === 'connected' && status.redis === 'connected';

  return NextResponse.json(
    {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: status,
    },
    { status: isHealthy ? 200 : 503 }
  );
}