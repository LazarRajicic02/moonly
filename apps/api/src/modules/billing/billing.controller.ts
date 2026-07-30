import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { StripeService } from '../../infrastructure/stripe/stripe.service';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(
    private readonly stripe: StripeService,
    private readonly prisma: PrismaService,
  ) {}

  @ApiBearerAuth()
  @Get('plans')
  plans() {
    return this.stripe.getPlans();
  }

  @ApiBearerAuth()
  @Get('subscription')
  async subscription(@CurrentUser() user: AuthUser) {
    return this.prisma.subscription.findUnique({ where: { userId: user.id } });
  }

  @ApiBearerAuth()
  @Post('checkout')
  checkout(@CurrentUser() user: AuthUser) {
    return this.stripe.createCheckoutSession(user.id);
  }

  @Public()
  @Post('webhook')
  webhook(@Body() body: unknown) {
    return { received: true, body };
  }
}
