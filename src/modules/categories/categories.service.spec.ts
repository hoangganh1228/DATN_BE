import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';

jest.mock('src/common/upload/upload.service', () => ({
  UploadService: jest.fn().mockImplementation(() => ({
    uploadFile: jest.fn(),
    replaceFile: jest.fn(),
    deleteFile: jest.fn(),
  })),
}));

import { CategoriesService } from './categories.service';
import { CategoryRepository } from './repositories/category.repository';
import { UploadService } from 'src/common/upload/upload.service';
import { AppException } from 'src/common/exceptions/app.exception';
import { CreateCategoryDto } from './dtos/create-category.dto';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockCategory = {
  id: 1,
  name: 'Điện thoại',
  slug: 'dien-thoai',
  description: 'Danh mục điện thoại',
  imageUrl: 'https://example.com/categories/1.jpg',
  parentId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCategoryRepository = {
  find: jest.fn(),
  findById: jest.fn(),
  findBySlug: jest.fn(),
  generateUniqueSlug: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

const mockUploadService = {
  uploadFile: jest.fn(),
  replaceFile: jest.fn(),
  deleteFile: jest.fn(),
};

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('CategoriesService', () => {
  let service: CategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: CategoryRepository, useValue: mockCategoryRepository },
        { provide: UploadService, useValue: mockUploadService },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── findAll ────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return all categories', async () => {
      const list = [mockCategory];
      mockCategoryRepository.find.mockResolvedValue(list);

      const result = await service.findAll();

      expect(mockCategoryRepository.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual(list);
    });
  });

  // ─── findOne ───────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should return category when found', async () => {
      mockCategoryRepository.findById.mockResolvedValue(mockCategory);

      const result = await service.findOne(1);

      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockCategory);
    });

    it('should throw NOT_FOUND when category does not exist', async () => {
      mockCategoryRepository.findById.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        new AppException('CATEGORY_NOT_FOUND', HttpStatus.NOT_FOUND),
      );
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(999);
    });
  });

  // ─── create ────────────────────────────────────────────────────────────────

  describe('create', () => {
    const createDto: CreateCategoryDto = {
      name: 'Điện thoại',
      description: 'Danh mục điện thoại',
    };

    it('should create category with slug and without file', async () => {
      const created = { ...mockCategory, ...createDto, slug: 'dien-thoai' };
      mockCategoryRepository.generateUniqueSlug.mockResolvedValue('dien-thoai');
      mockCategoryRepository.create.mockReturnValue(created);
      mockCategoryRepository.save.mockResolvedValue(created);

      const result = await service.create(createDto, undefined);

      expect(mockCategoryRepository.generateUniqueSlug).toHaveBeenCalledWith('dien-thoai');
      expect(mockUploadService.uploadFile).not.toHaveBeenCalled();
      expect(mockCategoryRepository.create).toHaveBeenCalledWith({
        ...createDto,
        slug: 'dien-thoai',
        imageUrl: null,
      });
      expect(mockCategoryRepository.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(created);
    });

    it('should create category with file and upload image', async () => {
      const file = { buffer: Buffer.from('') } as Express.Multer.File;
      const imageUrl = 'https://storage/categories/abc.jpg';
      const created = { ...mockCategory, ...createDto, slug: 'dien-thoai', imageUrl };
      mockCategoryRepository.generateUniqueSlug.mockResolvedValue('dien-thoai');
      mockUploadService.uploadFile.mockResolvedValue(imageUrl);
      mockCategoryRepository.create.mockReturnValue(created);
      mockCategoryRepository.save.mockResolvedValue(created);

      const result = await service.create(createDto, file);

      expect(mockUploadService.uploadFile).toHaveBeenCalledWith(file, 'categories');
      expect(mockCategoryRepository.create).toHaveBeenCalledWith({
        ...createDto,
        slug: 'dien-thoai',
        imageUrl,
      });
      expect(result).toEqual(created);
    });
  });

  // ─── update ────────────────────────────────────────────────────────────────

  describe('update', () => {
    const updateDto: CreateCategoryDto = {
      name: 'Điện thoại mới',
      description: 'Mô tả mới',
    };

    it('should update category without new file', async () => {
      mockCategoryRepository.findById.mockResolvedValue({ ...mockCategory });
      const updated = { ...mockCategory, ...updateDto };
      mockCategoryRepository.save.mockResolvedValue(updated);

      const result = await service.update(1, updateDto, undefined);

      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(1);
      expect(mockUploadService.replaceFile).not.toHaveBeenCalled();
      expect(mockCategoryRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(updateDto),
      );
      expect(result).toEqual(updated);
    });

    it('should update category and replace image when file provided', async () => {
      const file = { buffer: Buffer.from('') } as Express.Multer.File;
      const oldImageUrl = 'https://example.com/categories/1.jpg';
      const newImageUrl = 'https://storage/categories/new.jpg';
      mockCategoryRepository.findById.mockResolvedValue({ ...mockCategory, imageUrl: oldImageUrl });
      mockUploadService.replaceFile.mockResolvedValue(newImageUrl);
      const updated = { ...mockCategory, ...updateDto, imageUrl: newImageUrl };
      mockCategoryRepository.save.mockResolvedValue(updated);

      const result = await service.update(1, updateDto, file);

      expect(mockUploadService.replaceFile).toHaveBeenCalledWith(
        oldImageUrl,
        file,
        'categories',
      );
      expect(mockCategoryRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ ...updateDto, imageUrl: newImageUrl }),
      );
      expect(result.imageUrl).toBe(newImageUrl);
    });

    it('should throw NOT_FOUND when category does not exist', async () => {
      mockCategoryRepository.findById.mockResolvedValue(null);

      await expect(service.update(999, updateDto, undefined)).rejects.toThrow(
        new AppException('CATEGORY_NOT_FOUND', HttpStatus.NOT_FOUND),
      );
    });
  });

  // ─── remove ────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should remove category and delete image when imageUrl exists', async () => {
      mockCategoryRepository.findById.mockResolvedValue({ ...mockCategory });
      mockUploadService.deleteFile.mockResolvedValue(undefined);
      mockCategoryRepository.remove.mockResolvedValue(mockCategory);

      await service.remove(1);

      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(1);
      expect(mockUploadService.deleteFile).toHaveBeenCalledWith(mockCategory.imageUrl);
      expect(mockCategoryRepository.remove).toHaveBeenCalledWith(mockCategory);
    });

    it('should remove category without calling deleteFile when no imageUrl', async () => {
      const categoryNoImage = { ...mockCategory, imageUrl: null };
      mockCategoryRepository.findById.mockResolvedValue({ ...categoryNoImage });
      mockCategoryRepository.remove.mockResolvedValue(categoryNoImage);

      await service.remove(1);

      expect(mockUploadService.deleteFile).not.toHaveBeenCalled();
      expect(mockCategoryRepository.remove).toHaveBeenCalledWith(categoryNoImage);
    });

    it('should throw NOT_FOUND when category does not exist', async () => {
      mockCategoryRepository.findById.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(
        new AppException('CATEGORY_NOT_FOUND', HttpStatus.NOT_FOUND),
      );
      expect(mockCategoryRepository.remove).not.toHaveBeenCalled();
    });
  });
});
