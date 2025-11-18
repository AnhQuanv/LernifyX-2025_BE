import { Module } from '@nestjs/common';
import { PaymentItemsService } from './payment_items.service';
import { PaymentItemsController } from './payment_items.controller';

@Module({
  controllers: [PaymentItemsController],
  providers: [PaymentItemsService],
})
export class PaymentItemsModule {}
