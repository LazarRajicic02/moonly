import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { TrackingService } from './tracking.service';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

class WeightDto {
  @IsDateString() date!: string;
  @IsNumber() kg!: number;
  @IsOptional() @IsString() notes?: string;
}
class SleepDto {
  @IsDateString() date!: string;
  @IsNumber() @Min(0) @Max(24) hours!: number;
  @IsOptional() @IsInt() @Min(1) @Max(5) quality?: number;
  @IsOptional() @IsString() notes?: string;
}
class WaterDto {
  @IsDateString() date!: string;
  @IsInt() @Min(1) ml!: number;
}

@ApiTags('tracking')
@ApiBearerAuth()
@Controller('tracking')
export class TrackingController {
  constructor(private readonly tracking: TrackingService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.tracking.list(user.id);
  }

  @Post('weight')
  weight(@CurrentUser() user: AuthUser, @Body() dto: WeightDto) {
    return this.tracking.upsertWeight(user.id, dto);
  }

  @Post('sleep')
  sleep(@CurrentUser() user: AuthUser, @Body() dto: SleepDto) {
    return this.tracking.upsertSleep(user.id, dto);
  }

  @Post('water')
  water(@CurrentUser() user: AuthUser, @Body() dto: WaterDto) {
    return this.tracking.upsertWater(user.id, dto);
  }
}
