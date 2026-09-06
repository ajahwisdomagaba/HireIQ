import { prisma } from '../prisma';
import { logger } from '../logger';
import { env } from '../env';

export interface AIGatewayOptions<T> {
  agentName: string;
  promptVersion?: string;
  systemPrompt: string;
  userPrompt: string;
  schemaDescription?: string;
  model?: string;
  temperature?: number;
}

export interface AIGatewayResult<T> {
  data: T;
  aiRunId: string;
  latencyMs: number;
  costUSD: number;
}

export async function executeAIGateway<T>(
  options: AIGatewayOptions<T>
): Promise<AIGatewayResult<T>> {
  const {
    agentName,
    promptVersion = '1.0.0',
    systemPrompt,
    userPrompt,
    schemaDescription,
    model = 'claude-sonnet-4-5-20250929',
    temperature = 0.2,
  } = options;

  const startTime = Date.now();

  const systemInstructions = schemaDescription
    ? `${systemPrompt}\n\nYou must return strictly valid JSON matching this schema:\n${schemaDescription}\nDo NOT wrap the JSON in Markdown backticks or commentary. Return raw JSON text only.`
    : systemPrompt;

  const baseUrl = env.QOREBIT_BASE_URL.replace(/\/+$/, '');
  const url = baseUrl.endsWith('/chat/completions')
    ? baseUrl
    : `${baseUrl}/chat/completions`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.QOREBIT_API_KEY}`,
        'User-Agent': 'HireIQ-Backend/1.0',
      },
      body: JSON.stringify({
        model,
        temperature,
        messages: [
          { role: 'system', content: systemInstructions },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(
        `Qorebit Gateway HTTP ${response.status}: ${
          responseData.error?.message || responseData.error || JSON.stringify(responseData)
        }`
      );
    }

    const latencyMs = Date.now() - startTime;
    const rawContent =
      responseData.choices?.[0]?.message?.content ||
      responseData.content?.[0]?.text ||
      '';

    const inputTokens = responseData.usage?.prompt_tokens || 0;
    const outputTokens = responseData.usage?.completion_tokens || 0;
    const costUSD = responseData.usage?.cost || 0.0005;

    let parsedData: any = rawContent;
    if (schemaDescription) {
      const cleaned = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    const aiRun = await prisma.aIRun.create({
      data: {
        agentName,
        modelName: model,
        promptVersion,
        latencyMs,
        inputTokens,
        outputTokens,
        estimatedCostUSD: costUSD,
        status: 'SUCCESS',
      },
    });

    return {
      data: parsedData as T,
      aiRunId: aiRun.id,
      latencyMs,
      costUSD,
    };
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    await prisma.aIRun.create({
      data: {
        agentName,
        modelName: model,
        promptVersion,
        latencyMs,
        inputTokens: 0,
        outputTokens: 0,
        estimatedCostUSD: 0,
        status: 'FAILED',
        errorMessage: error.message || 'AI Gateway Error',
      },
    });

    logger.error({ agentName, error: error.message }, 'AI Gateway execution failed');
    throw error;
  }
}