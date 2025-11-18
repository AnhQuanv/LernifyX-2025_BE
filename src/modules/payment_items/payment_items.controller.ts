import { Controller } from '@nestjs/common';
import { PaymentItemsService } from './payment_items.service';

@Controller('payment-items')
export class PaymentItemsController {
  constructor(private readonly paymentItemsService: PaymentItemsService) {}
}
