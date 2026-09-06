// scripts/test-ai-gateway.ts
import 'dotenv/config';
import { env } from '../lib/env';

async function diagnose() {
  console.log('--- Network Diagnosis ---');
  console.log('QOREBIT_BASE_URL:', env.QOREBIT_BASE_URL);
  console.log('QOREBIT_API_KEY prefix:', env.QOREBIT_API_KEY?.slice(0, 10) + '...');

  const targetUrl = env.QOREBIT_BASE_URL.replace(/\/+$/, '') + '/chat/completions';
  console.log('Target Fetch URL:', targetUrl);

  try {
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.QOREBIT_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'claude-3-7-sonnet-20250219',
        messages: [{ role: 'user', content: 'ping' }],
      }),
    });

    console.log('HTTP Status:', res.status, res.statusText);
    const text = await res.text();
    console.log('Response Body:', text);
  } catch (err: any) {
    console.error('Detailed Error Code:', err.cause?.code || err.code);
    console.error('Detailed Error Message:', err.cause?.message || err.message);
    console.error('Full Error Cause:', err.cause);
  }

  process.exit(0);
}

diagnose();