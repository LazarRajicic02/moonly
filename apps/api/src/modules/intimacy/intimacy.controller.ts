import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IntimacyLocation } from '@prisma/client';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { IntimacyService } from './intimacy.service';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { Audit } from '../../common/decorators/public.decorator';

class IntimacyDto {
  @IsDateString() date!: string;
  @IsOptional() @IsBoolean() protected?: boolean;
  @IsOptional() @IsInt() @Min(1) @Max(5) rating?: number;
  @IsOptional() @IsEnum(IntimacyLocation) location?: IntimacyLocation;
  @IsOptional() @IsString() @MaxLength(500) notes?: string;
}

@ApiTags('intimacy')
@ApiBearerAuth()
@Controller('intimacy')
export class IntimacyController {
  constructor(private readonly intimacy: IntimacyService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query('from') from?: string, @Query('to') to?: string) {
    return this.intimacy.list(user.id, from, to);
  }

  @Audit('intimacy')
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: IntimacyDto) {
    return this.intimacy.create(user.id, dto);
  }

  @Audit('intimacy')
  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.intimacy.remove(user.id, id);
  }
}
