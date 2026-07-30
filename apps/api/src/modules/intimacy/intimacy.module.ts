import { Module } from '@nestjs/common';
import { IntimacyService } from './intimacy.service';
import { IntimacyController } from './intimacy.controller';

@Module({ controllers: [IntimacyController], providers: [IntimacyService] })
export class IntimacyModule {}
