import { z } from 'zod';

// Only load dotenv in non-edge Node environments if available
if (typeof process !== 'undefined' && process.release?.name === 'node') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('dotenv').config();
  } catch {}
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),
  REDIS_URL: z.string().url(),
  QOREBIT_API_KEY: z.string().min(1),
  QOREBIT_BASE_URL: z.string().url().default('https://api.qorebit.com/v1'),
  JWT_SECRET: z.string().min(32),
  STORAGE_ENDPOINT: z.string().optional(),
  STORAGE_BUCKET: z.string().default('hireiq-documents'),
  STORAGE_ACCESS_KEY: z.string().optional(),
  STORAGE_SECRET_KEY: z.string().optional(),
  DAILY_API_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid environment variables:', JSON.stringify(result.error.format(), null, 2));
    throw new Error('Invalid environment configuration');
  }
  return result.data;
}

export const env = validateEnv();