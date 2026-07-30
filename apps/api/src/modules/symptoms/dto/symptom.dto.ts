import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SymptomType } from '@prisma/client';

export class CreateSymptomDto {
  @ApiProperty()
  @IsDateString()
  date!: string;

  @ApiProperty({ enum: SymptomType })
  @IsEnum(SymptomType)
  type!: SymptomType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  severity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
