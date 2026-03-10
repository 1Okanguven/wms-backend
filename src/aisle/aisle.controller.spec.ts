import { Test, TestingModule } from '@nestjs/testing';
import { AisleController } from './aisle.controller';
import { AisleService } from './aisle.service';

describe('AisleController', () => {
  let controller: AisleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AisleController],
      providers: [AisleService],
    }).compile();

    controller = module.get<AisleController>(AisleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
