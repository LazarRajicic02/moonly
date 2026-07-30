import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { AssistantService } from './ai.service';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

class ChatDto {
  @IsString() @MinLength(1) @MaxLength(4000) message!: string;
  @IsOptional() @IsUUID() conversationId?: string;
}

@ApiTags('ai')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(private readonly assistant: AssistantService) {}

  @Get('conversations')
  list(@CurrentUser() user: AuthUser) {
    return this.assistant.list(user.id);
  }

  @Post('chat')
  chat(@CurrentUser() user: AuthUser, @Body() dto: ChatDto) {
    return this.assistant.chat(user.id, dto.message, dto.conversationId);
  }
}
