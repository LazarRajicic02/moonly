import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StripeService {
  constructor(private readonly config: ConfigService) {}

  isConfigured() {
    return Boolean(this.config.get('STRIPE_SECRET_KEY'));
  }

  getPlans() {
    return [
      {
        id: 'luna-plus-monthly',
        name: 'Luna Plus',
        priceId: this.config.get('STRIPE_PRICE_ID_MONTHLY') || null,
        amount: 9.99,
        currency: 'usd',
        interval: 'month',
      },
    ];
  }

  async createCheckoutSession(_userId: string) {
    if (!this.isConfigured()) {
      return { configured: false, message: 'Stripe is not configured' };
    }
    return {
      configured: true,
      message: 'Stripe checkout placeholder — wire Stripe SDK here',
      url: null,
    };
  }
}
