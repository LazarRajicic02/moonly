import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly config: ConfigService) {}

  async chat(messages: Array<{ role: string; content: string }>) {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      const last = messages.filter((m) => m.role === 'user').at(-1)?.content ?? '';
      return {
        content:
          "I'm Luna's health assistant (offline mode). I can help you reflect on cycle patterns, symptoms, and wellness habits. " +
          'Configure OPENAI_API_KEY for full AI responses. You asked: ' +
          last.slice(0, 200),
        model: 'fallback',
      };
    }

    const base = this.config.get('OPENAI_BASE_URL', 'https://api.openai.com/v1');
    const model = this.config.get('OPENAI_MODEL', 'gpt-4o-mini');
    const res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content:
              "You are Luna, a supportive women's health assistant. You are not a doctor. Encourage professional care for medical decisions.",
          },
          ...messages,
        ],
        temperature: 0.6,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      this.logger.error(text);
      return { content: 'AI provider error. Please try again later.', model };
    }
    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return {
      content: json.choices?.[0]?.message?.content ?? 'No response',
      model,
    };
  }
}
