import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { FertilitySignType } from '@prisma/client';
import { FertilityService } from './fertility.service';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

class FertilityDto {
  @IsDateString() date!: string;
  @IsEnum(FertilitySignType) type!: FertilitySignType;
  @IsString() value!: string;
  @IsOptional() @IsString() notes?: string;
}

@ApiTags('fertility')
@ApiBearerAuth()
@Controller('fertility')
export class FertilityController {
  constructor(private readonly fertility: FertilityService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.fertility.list(user.id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: FertilityDto) {
    return this.fertility.create(user.id, dto);
  }
}
