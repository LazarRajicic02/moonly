import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MoodService } from './mood.service';
import { CreateMoodDto } from './dto/mood.dto';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { Audit } from '../../common/decorators/public.decorator';

@ApiTags('mood')
@ApiBearerAuth()
@Controller('mood')
export class MoodController {
  constructor(private readonly mood: MoodService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query('from') from?: string, @Query('to') to?: string) {
    return this.mood.list(user.id, from, to);
  }

  @Audit('mood')
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateMoodDto) {
    return this.mood.create(user.id, dto);
  }

  @Audit('mood')
  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.mood.remove(user.id, id);
  }
}
