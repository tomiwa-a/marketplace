import { Test, TestingModule } from '@nestjs/testing';
import { MessagingGateway } from './messaging.gateway';
import { MessagingService } from './messaging.service';

describe('MessagingGateway', () => {
  let gateway: MessagingGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessagingGateway, MessagingService],
    }).compile();

    gateway = module.get<MessagingGateway>(MessagingGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
