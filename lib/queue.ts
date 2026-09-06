import { Queue } from 'bullmq';
import Redis, { type RedisOptions } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error('❌ REDIS_URL environment variable is missing.');
}

const isTls = redisUrl.startsWith('rediss://');

const redisOptions: RedisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  autoResubscribe: true,
  retryStrategy(times) {
    const delay = Math.min(times * 500, 5000);
    return delay;
  },
  reconnectOnError(err) {
    const targetError = 'READONLY';
    return err.message.includes(targetError);
  },
  ...(isTls && {
    tls: {
      rejectUnauthorized: false,
    },
  }),
};

export const redisConnection = new Redis(redisUrl, redisOptions);

redisConnection.on('connect', () => {
  console.log('📡 [Redis] Connected successfully to Redis / Upstash');
});

redisConnection.on('error', (err) => {
  console.error('❌ [Redis] Connection error:', err.message);
});

export const RESUME_QUEUE_NAME = 'candidate-resume-processing';

export const resumeQueue = new Queue(RESUME_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});