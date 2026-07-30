import { Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GdprService } from './gdpr.service';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

@ApiTags('gdpr')
@ApiBearerAuth()
@Controller('gdpr')
export class GdprController {
  constructor(private readonly gdpr: GdprService) {}

  @Post('export')
  export(@CurrentUser() user: AuthUser) {
    return this.gdpr.requestExport(user.id);
  }

  @Get('exports')
  list(@CurrentUser() user: AuthUser) {
    return this.gdpr.listExports(user.id);
  }

  @Post('delete')
  delete(@CurrentUser() user: AuthUser) {
    return this.gdpr.deleteAccount(user.id);
  }
}
