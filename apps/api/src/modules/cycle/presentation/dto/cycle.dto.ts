import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FlowLevel } from '@prisma/client';

export class CreateCycleDto {
  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  startDate!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class UpdateCycleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreatePeriodDayDto {
  @ApiProperty()
  @IsDateString()
  date!: string;

  @ApiPropertyOptional({ enum: FlowLevel })
  @IsOptional()
  @IsEnum(FlowLevel)
  flow?: FlowLevel;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cycleId?: string;
}
