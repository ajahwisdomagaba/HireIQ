import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.QOREBIT_API_KEY;
const baseUrl = process.env.QOREBIT_BASE_URL || 'https://api.qorebit.ai/v1';

async function listModels() {
  try {
    const res = await fetch(`${baseUrl}/models`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!res.ok) {
      console.error('Failed to fetch models:', res.status, await res.text());
      return;
    }

    const data = await res.json();
    console.log('Available Qorebit Models:');
    console.log(data.data.map((m) => m.id));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

listModels();