import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsDateString, IsString, MaxLength, MinLength } from 'class-validator';
import { NotesService } from './notes.service';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

class NoteDto {
  @IsDateString() date!: string;
  @IsString() @MinLength(1) @MaxLength(5000) content!: string;
}

@ApiTags('notes')
@ApiBearerAuth()
@Controller('notes')
export class NotesController {
  constructor(private readonly notes: NotesService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.notes.list(user.id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: NoteDto) {
    return this.notes.create(user.id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.notes.remove(user.id, id);
  }
}
