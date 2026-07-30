import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { GdprService } from './gdpr.service';
import { GdprController } from './gdpr.controller';

@Module({
  imports: [BullModule.registerQueue({ name: 'gdpr-export' })],
  controllers: [GdprController],
  providers: [GdprService],
  exports: [GdprService],
})
export class GdprModule {}
