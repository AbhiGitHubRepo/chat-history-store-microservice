import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from '../health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  describe('health', () => {
    it('should return health status', () => {
      const result = controller.health();

      expect(result).toEqual({ status: 'ok' });
    });

    it('should always return the same health status', () => {
      const result1 = controller.health();
      const result2 = controller.health();

      expect(result1).toEqual(result2);
      expect(result1).toEqual({ status: 'ok' });
    });
  });
});
