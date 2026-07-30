import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SymptomsService } from './symptoms.service';
import { CreateSymptomDto } from './dto/symptom.dto';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { Audit } from '../../common/decorators/public.decorator';

@ApiTags('symptoms')
@ApiBearerAuth()
@Controller('symptoms')
export class SymptomsController {
  constructor(private readonly symptoms: SymptomsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query('from') from?: string, @Query('to') to?: string) {
    return this.symptoms.list(user.id, from, to);
  }

  @Audit('symptom')
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateSymptomDto) {
    return this.symptoms.create(user.id, dto);
  }

  @Audit('symptom')
  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.symptoms.remove(user.id, id);
  }
}
