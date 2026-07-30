import {
  IsArray,
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  displayName!: string;

  @ApiPropertyOptional({ enum: ['en', 'sr'] })
  @IsOptional()
  @IsIn(['en', 'sr'])
  locale?: 'en' | 'sr';

  @ApiPropertyOptional({ description: 'Date of birth, YYYY-MM-DD' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ description: 'Average cycle length in days' })
  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(60)
  averageCycleLen?: number;

  @ApiPropertyOptional({ description: 'Average period length in days' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(15)
  averagePeriodLen?: number;

  @ApiPropertyOptional({ description: 'First day of last period, YYYY-MM-DD' })
  @IsOptional()
  @IsDateString()
  lastPeriodStart?: string;

  @ApiPropertyOptional({ description: 'Tracking goals' })
  @IsOptional()
  @IsArray()
  goals?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(230)
  heightCm?: number;
}

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  password!: string;
}

export class RefreshDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
