export interface BroadcastJobPayload {
  id: string;
  title: string;
  companyName: string;
  location: string;
  employmentType: string;
  salaryRange?: string;
  summary: string;
  requirements: string[];
  applyUrl: string;
}

export interface BroadcastResult {
  telegram: { success: boolean; messageId?: number; error?: string };
  linkedin: { shareUrl: string; textPayload: string };
  jobbermanFeedUrl: string;
}

/**
 * Broadcasts a job posting to a designated Telegram Channel via Telegram Bot API
 */
export async function broadcastToTelegram(job: BroadcastJobPayload): Promise<{ success: boolean; messageId?: number; error?: string }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID;

  if (!botToken || !channelId) {
    return {
      success: false,
      error: 'Telegram Bot Token or Channel ID is missing in environment variables.',
    };
  }

  const requirementsList = job.requirements.slice(0, 4).map((r) => `• ${r}`).join('\n');

  const text = `🚀 *NEW JOB OPENING | ${job.companyName.toUpperCase()}*\n\n` +
    `📌 *Role:* ${job.title}\n` +
    `📍 *Location:* ${job.location} (${job.employmentType})\n` +
    (job.salaryRange ? `💰 *Compensation:* ${job.salaryRange}\n\n` : '\n') +
    `📝 *Overview:*\n${job.summary}\n\n` +
    (requirementsList ? `🎯 *Key Requirements:*\n${requirementsList}\n\n` : '') +
    `⚡ *Apply directly on HireIQ:*\n[Apply for this position](${job.applyUrl})`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: channelId,
        text,
        parse_mode: 'Markdown',
        disable_web_page_preview: false,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '⚡ Apply on HireIQ',
                url: job.applyUrl,
              },
            ],
          ],
        },
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      return { success: false, error: data.description || 'Telegram API error' };
    }

    return { success: true, messageId: data.result?.message_id };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error broadcasting to Telegram' };
  }
}

/**
 * Generates LinkedIn Share URL & formatted clipboard copy payload
 */
export function generateLinkedInSharePayload(job: BroadcastJobPayload): { shareUrl: string; textPayload: string } {
  const encodedUrl = encodeURIComponent(job.applyUrl);
  const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;

  const textPayload =
    `We're hiring a ${job.title} at ${job.companyName}!\n\n` +
    `📍 Location: ${job.location} (${job.employmentType})\n` +
    (job.salaryRange ? `💰 Compensation: ${job.salaryRange}\n\n` : '\n') +
    `Apply directly via our verified HireIQ portal:\n${job.applyUrl}\n\n` +
    `#Hiring #NigerianTech #JobOpportunity #HireIQ`;

  return { shareUrl, textPayload };
}