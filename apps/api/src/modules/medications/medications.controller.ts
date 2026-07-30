import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';
import { MedicationsService } from './medications.service';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

class MedDto {
  @IsString() name!: string;
  @IsOptional() @IsString() dosage?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsArray() reminderTimes?: string[];
  @IsOptional() @IsBoolean() active?: boolean;
}

class TakeDoseDto {
  @IsDateString() date!: string;
}

@ApiTags('medications')
@ApiBearerAuth()
@Controller('medications')
export class MedicationsController {
  constructor(private readonly medications: MedicationsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.medications.list(user.id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: MedDto) {
    return this.medications.create(user.id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.medications.remove(user.id, id);
  }

  @Post(':id/take')
  take(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: TakeDoseDto) {
    return this.medications.takeDose(user.id, id, dto.date);
  }

  @Delete(':id/take/:date')
  untake(@CurrentUser() user: AuthUser, @Param('id') id: string, @Param('date') date: string) {
    return this.medications.untakeDose(user.id, id, date);
  }
}
