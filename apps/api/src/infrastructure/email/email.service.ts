import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private client: Resend | null = null;

  constructor(private readonly config: ConfigService) {
    const key = config.get<string>('RESEND_API_KEY');
    if (key) this.client = new Resend(key);
  }

  async send(to: string, subject: string, html: string) {
    if (!this.client) {
      this.logger.log(`[email:noop] to=${to} subject=${subject}`);
      return { id: 'noop' };
    }
    return this.client.emails.send({
      from: this.config.get('RESEND_FROM', 'Luna <noreply@luna.health>'),
      to,
      subject,
      html,
    });
  }
}
