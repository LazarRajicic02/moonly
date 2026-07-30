import { Module } from '@nestjs/common';
import { FertilityService } from './fertility.service';
import { FertilityController } from './fertility.controller';

@Module({ controllers: [FertilityController], providers: [FertilityService] })
export class FertilityModule {}
