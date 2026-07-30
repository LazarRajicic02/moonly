import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';
import { PregnancyService } from './pregnancy.service';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

class PregnancyDto {
  @IsOptional() @IsDateString() dueDate?: string;
  @IsOptional() @IsDateString() lmpDate?: string;
  @IsOptional() @IsBoolean() active?: boolean;
  @IsOptional() @IsString() notes?: string;
}
class CheckInDto {
  @IsDateString() date!: string;
  @IsOptional() @IsNumber() week?: number;
  @IsOptional() @IsNumber() weightKg?: number;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsArray() symptoms?: string[];
}

@ApiTags('pregnancy')
@ApiBearerAuth()
@Controller('pregnancy')
export class PregnancyController {
  constructor(private readonly pregnancy: PregnancyService) {}

  @Get()
  get(@CurrentUser() user: AuthUser) {
    return this.pregnancy.get(user.id);
  }

  @Put()
  upsert(@CurrentUser() user: AuthUser, @Body() dto: PregnancyDto) {
    return this.pregnancy.upsert(user.id, dto);
  }

  @Post('check-ins')
  checkIn(@CurrentUser() user: AuthUser, @Body() dto: CheckInDto) {
    return this.pregnancy.addCheckIn(user.id, dto);
  }
}
