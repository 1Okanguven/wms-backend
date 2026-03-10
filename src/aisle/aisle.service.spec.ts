import { Test, TestingModule } from '@nestjs/testing';
import { AisleService } from './aisle.service';

describe('AisleService', () => {
  let service: AisleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AisleService],
    }).compile();

    service = module.get<AisleService>(AisleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
