import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { NotificationsService } from './notifications.service';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

class TokenDto {
  @IsString() token!: string;
  @IsOptional() @IsString() platform?: string;
}
class PrefDto {
  @IsOptional() @IsBoolean() pushEnabled?: boolean;
  @IsOptional() @IsBoolean() emailEnabled?: boolean;
  @IsOptional() @IsBoolean() medicationRemind?: boolean;
  @IsOptional() @IsBoolean() cycleReminders?: boolean;
  @IsOptional() @IsBoolean() marketing?: boolean;
}

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Post('device-token')
  token(@CurrentUser() user: AuthUser, @Body() dto: TokenDto) {
    return this.notifications.registerToken(user.id, dto.token, dto.platform);
  }

  @Get('preferences')
  getPrefs(@CurrentUser() user: AuthUser) {
    return this.notifications.getPreferences(user.id);
  }

  @Patch('preferences')
  updatePrefs(@CurrentUser() user: AuthUser, @Body() dto: PrefDto) {
    return this.notifications.updatePreferences(user.id, dto);
  }
}
