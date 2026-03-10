import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

const mockCategoriesService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('CategoriesController', () => {
  let controller: CategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [{ provide: CategoriesService, useValue: mockCategoriesService }],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return list of categories', async () => {
      const list = [{ id: 1, name: 'Điện thoại', slug: 'dien-thoai' }];
      mockCategoriesService.findAll.mockResolvedValue(list);

      const result = await controller.findAll();

      expect(mockCategoriesService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(list);
    });
  });

  describe('findOne', () => {
    it('should return category by id', async () => {
      const category = { id: 1, name: 'Điện thoại', slug: 'dien-thoai' };
      mockCategoriesService.findOne.mockResolvedValue(category);

      const result = await controller.findOne(1);

      expect(mockCategoriesService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(category);
    });
  });

  describe('create', () => {
    it('should call service.create with dto and file', async () => {
      const dto = { name: 'Điện thoại', description: 'Mô tả' };
      const file = {} as Express.Multer.File;
      const created = { id: 1, ...dto, slug: 'dien-thoai' };
      mockCategoriesService.create.mockResolvedValue(created);

      const result = await controller.create(dto, file);

      expect(mockCategoriesService.create).toHaveBeenCalledWith(dto, file);
      expect(result).toEqual(created);
    });
  });

  describe('update', () => {
    it('should call service.update with id, dto and file', async () => {
      const id = 1;
      const dto = { name: 'Điện thoại mới' };
      const file = undefined as unknown as Express.Multer.File;
      const updated = { id, ...dto, slug: 'dien-thoai-moi' };
      mockCategoriesService.update.mockResolvedValue(updated);

      const result = await controller.update(id, dto, file);

      expect(mockCategoriesService.update).toHaveBeenCalledWith(id, dto, file);
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should call service.remove with id', async () => {
      mockCategoriesService.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(mockCategoriesService.remove).toHaveBeenCalledWith(1);
    });
  });
});
