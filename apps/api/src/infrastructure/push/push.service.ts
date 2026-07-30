import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private ready = false;

  constructor(private readonly config: ConfigService) {
    const projectId = config.get<string>('FIREBASE_PROJECT_ID');
    this.ready = Boolean(projectId);
  }

  async send(token: string, title: string, body: string) {
    if (!this.ready) {
      this.logger.log(`[push:noop] token=${token.slice(0, 8)}… title=${title}`);
      return { success: true, noop: true };
    }
    // Firebase Admin init left as extension point when credentials are provided.
    this.logger.log(`[push:configured] would send to ${token.slice(0, 8)}… ${title}: ${body}`);
    return { success: true };
  }
}
