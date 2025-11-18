import { Test, TestingModule } from '@nestjs/testing';
import { PaymentItemsService } from './payment_items.service';

describe('PaymentItemsService', () => {
  let service: PaymentItemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentItemsService],
    }).compile();

    service = module.get<PaymentItemsService>(PaymentItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
