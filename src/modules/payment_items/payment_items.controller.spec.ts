import { Test, TestingModule } from '@nestjs/testing';
import { PaymentItemsController } from './payment_items.controller';
import { PaymentItemsService } from './payment_items.service';

describe('PaymentItemsController', () => {
  let controller: PaymentItemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentItemsController],
      providers: [PaymentItemsService],
    }).compile();

    controller = module.get<PaymentItemsController>(PaymentItemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
