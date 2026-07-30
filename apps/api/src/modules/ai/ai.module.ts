import { Module } from '@nestjs/common';
import { AssistantService } from './ai.service';
import { AiController } from './ai.controller';

@Module({ controllers: [AiController], providers: [AssistantService] })
export class AiModule {}
