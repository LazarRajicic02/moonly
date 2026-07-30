import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';
import { CycleService } from '../application/cycle.service';
import { CreateCycleDto, CreatePeriodDayDto, UpdateCycleDto } from './dto/cycle.dto';
import { CurrentUser, AuthUser } from '../../../common/decorators/current-user.decorator';
import { Audit } from '../../../common/decorators/public.decorator';

class EndPeriodDto {
  @IsDateString() endDate!: string;
}

@ApiTags('cycles')
@ApiBearerAuth()
@Controller('cycles')
export class CycleController {
  constructor(private readonly cycles: CycleService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.cycles.list(user.id);
  }

  @Get('predictions')
  prediction(@CurrentUser() user: AuthUser) {
    return this.cycles.getPrediction(user.id);
  }

  @Audit('cycle')
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCycleDto) {
    return this.cycles.create(user.id, dto);
  }

  @Audit('cycle')
  @Patch(':id')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateCycleDto) {
    return this.cycles.update(user.id, id, dto);
  }

  @Audit('cycle')
  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.cycles.remove(user.id, id);
  }

  @Audit('period-day')
  @Post('period-days')
  addDay(@CurrentUser() user: AuthUser, @Body() dto: CreatePeriodDayDto) {
    return this.cycles.addPeriodDay(user.id, dto);
  }

  @Audit('period-day')
  @Delete('period-days/:date')
  removeDay(@CurrentUser() user: AuthUser, @Param('date') date: string) {
    return this.cycles.removePeriodDay(user.id, date);
  }

  @Audit('cycle')
  @Post('end-period')
  endPeriod(@CurrentUser() user: AuthUser, @Body() dto: EndPeriodDto) {
    return this.cycles.endActivePeriod(user.id, dto.endDate);
  }
}
