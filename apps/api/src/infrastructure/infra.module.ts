import { Global, Module } from '@nestjs/common';
import { EmailService } from './email/email.service';
import { PushService } from './push/push.service';
import { AiService } from './ai/ai.service';
import { PdfService } from './pdf/pdf.service';
import { StripeService } from './stripe/stripe.service';

@Global()
@Module({
  providers: [EmailService, PushService, AiService, PdfService, StripeService],
  exports: [EmailService, PushService, AiService, PdfService, StripeService],
})
export class InfraModule {}
