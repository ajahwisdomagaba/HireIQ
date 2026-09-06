// lib/redis.ts
import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

export const redisConnection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,
  tls: env.REDIS_URL.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redisConnection.on('connect', () => {
  logger.info('Connected to Upstash Redis instance');
});

redisConnection.on('error', (err) => {
  logger.error({ err }, 'Redis connection error');
});