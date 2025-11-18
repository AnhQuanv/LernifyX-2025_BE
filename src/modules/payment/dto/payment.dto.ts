import { PaymentItemDto } from 'src/modules/payment_items/dto/payment-item.dto';

export class PaymentHistoryDto {
  id: string;
  transactionRef: string;
  amount: number;
  currency: string;
  status: string;
  gateway: string;
  paidAt?: Date;
  createdAt: Date;
  items: PaymentItemDto[];
}
