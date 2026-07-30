import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MoodType } from '@prisma/client';

export class CreateMoodDto {
  @ApiProperty()
  @IsDateString()
  date!: string;

  @ApiProperty({ enum: MoodType })
  @IsEnum(MoodType)
  mood!: MoodType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  intensity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
