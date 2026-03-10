import { Test, TestingModule } from '@nestjs/testing';
import { RackController } from './rack.controller';
import { RackService } from './rack.service';

describe('RackController', () => {
  let controller: RackController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RackController],
      providers: [RackService],
    }).compile();

    controller = module.get<RackController>(RackController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
