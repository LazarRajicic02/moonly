import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { validateEnv } from './config/env';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { InfraModule } from './infrastructure/infra.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AuditInterceptor } from './modules/audit/audit.interceptor';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AuditModule } from './modules/audit/audit.module';
import { HealthModule } from './modules/health/health.module';
import { CycleModule } from './modules/cycle/cycle.module';
import { SymptomsModule } from './modules/symptoms/symptoms.module';
import { MoodModule } from './modules/mood/mood.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { StatsModule } from './modules/stats/stats.module';
import { TrackingModule } from './modules/tracking/tracking.module';
import { PregnancyModule } from './modules/pregnancy/pregnancy.module';
import { FertilityModule } from './modules/fertility/fertility.module';
import { MedicationsModule } from './modules/medications/medications.module';
import { AiModule } from './modules/ai/ai.module';
import { ReportsModule } from './modules/reports/reports.module';
import { GdprModule } from './modules/gdpr/gdpr.module';
import { AdminModule } from './modules/admin/admin.module';
import { BillingModule } from './modules/billing/billing.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { IntimacyModule } from './modules/intimacy/intimacy.module';
import { NotesModule } from './modules/notes/notes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('THROTTLE_TTL', 60) * 1000,
          limit: config.get<number>('THROTTLE_LIMIT', 100),
        },
      ],
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: { url: config.getOrThrow<string>('REDIS_URL') },
      }),
    }),
    PrismaModule,
    RedisModule,
    InfraModule,
    AuditModule,
    AuthModule,
    UsersModule,
    HealthModule,
    CycleModule,
    SymptomsModule,
    MoodModule,
    CalendarModule,
    StatsModule,
    TrackingModule,
    PregnancyModule,
    FertilityModule,
    MedicationsModule,
    AiModule,
    ReportsModule,
    GdprModule,
    AdminModule,
    BillingModule,
    NotificationsModule,
    JobsModule,
    IntimacyModule,
    NotesModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule {}
