import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.QOREBIT_API_KEY;
const baseUrl = process.env.QOREBIT_BASE_URL || 'https://api.qorebit.ai/v1';

async function verifyQorebit() {
  console.log(`Connecting to Qorebit at: ${baseUrl}`);

  // 1. Test Chat Completion
  try {
    const chatRes = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Say hello in one word.' }],
      }),
    });

    if (!chatRes.ok) {
      console.error('Chat Completion Failed:', chatRes.status, await chatRes.text());
    } else {
      const chatData = await chatRes.json();
      console.log('✅ Chat Completion OK:', chatData.choices[0].message.content.trim());
    }
  } catch (err) {
    console.error('❌ Chat Request Error:', err.message);
  }

  // 2. Test Embeddings
  try {
    const embRes = await fetch(`${baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: 'Test candidate resume embedding',
      }),
    });

    if (!embRes.ok) {
      console.error('Embeddings Failed:', embRes.status, await embRes.text());
    } else {
      const embData = await embRes.json();
      console.log('Embeddings OK! Dimensions:', embData.data[0].embedding.length);
    }
  } catch (err) {
    console.error('Embedding Request Error:', err.message);
  }
}

verifyQorebit();