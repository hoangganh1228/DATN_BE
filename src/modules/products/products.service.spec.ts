import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { QueryProductDto } from './dtos/query-product.dto';
import { Product } from './entities/product.entity';
import { Readable } from 'stream';

// ── Mock data ──────────────────────────────────────────────────────────────
const mockProduct: Partial<Product> = {
  id:            1,
  name:          'Áo thun nam',
  slug:          'ao-thun-nam',
  price:         150000,
  stockQuantity: 50,
  status:        'active',
  imageUrl:      'https://s3.amazonaws.com/products/ao-thun-nam.jpg',
};

const mockFile: Express.Multer.File = {
  fieldname:    'image',
  originalname: 'product.jpg',
  encoding:     '7bit',
  mimetype:     'image/jpeg',
  buffer:       Buffer.from(''),
  size:         1024,
  stream:       Readable.from(Buffer.from('')),
  destination:  '',
  filename:     '',
  path:         '',
};

const mockPaginatedResult = {
  data:       [mockProduct],
  total:      1,
  page:       1,
  limit:      10,
  totalPages: 1,
};

// ── Mock service ───────────────────────────────────────────────────────────
const mockProductsService = {
  findAll:      jest.fn(),
  findOne:      jest.fn(),
  findBySlug:   jest.fn(),
  create:       jest.fn(),
  update:       jest.fn(),
  remove:       jest.fn(),
  updateStatus: jest.fn(),
  updateStock:  jest.fn(),
};

// ── Test suite ─────────────────────────────────────────────────────────────
describe('ProductsController', () => {
  let controller: ProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        { provide: ProductsService, useValue: mockProductsService },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ── findAll ──────────────────────────────────────────────────────────────
  describe('findAll', () => {
    it('Should call service.findAll with the correct query', async () => {
      const query: QueryProductDto = { page: 1, limit: 10, search: 'áo' };
      mockProductsService.findAll.mockResolvedValue(mockPaginatedResult);

      const result = await controller.findAll(query);

      expect(mockProductsService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockPaginatedResult);
    });
  });

  // ── findOne ──────────────────────────────────────────────────────────────
  describe('findOne', () => {
    it('Should call service.findOne with the correct id', async () => {
      mockProductsService.findOne.mockResolvedValue(mockProduct);

      const result = await controller.findOne(1);

      expect(mockProductsService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockProduct);
    });
  });

  // ── findBySlug ───────────────────────────────────────────────────────────
  describe('findBySlug', () => {
    it('Should call service.findBySlug with the correct slug', async () => {
      mockProductsService.findBySlug.mockResolvedValue(mockProduct);

      const result = await controller.findBySlug('ao-thun-nam');

      expect(mockProductsService.findBySlug).toHaveBeenCalledWith('ao-thun-nam');
      expect(result).toEqual(mockProduct);
    });
  });

  // ── create ───────────────────────────────────────────────────────────────
  describe('create', () => {
    it('Should call service.create with the correct dto and file', async () => {
      const dto: CreateProductDto = {
        name:          'Áo thun nam',
        price:         150000,
        stockQuantity: 50,
      };
      mockProductsService.create.mockResolvedValue(mockProduct);

      const result = await controller.create(dto, mockFile);

      expect(mockProductsService.create).toHaveBeenCalledWith(dto, mockFile);
      expect(result).toEqual(mockProduct);
    });

    it('Should call service.create with the correct dto and no file', async () => {
      const dto: CreateProductDto = {
        name:          'Áo thun nam',
        price:         150000,
        stockQuantity: 50,
      };
      mockProductsService.create.mockResolvedValue({ ...mockProduct, imageUrl: null });

      const result = await controller.create(dto, undefined as unknown as Express.Multer.File);

      expect(mockProductsService.create).toHaveBeenCalledWith(dto, undefined);
      expect(result.imageUrl).toBeNull();
    });
  });

  // ── update ───────────────────────────────────────────────────────────────
  describe('update', () => {
    it('Should call service.update with the correct id, dto and file', async () => {
      const dto: UpdateProductDto = { price: 200000 };
      mockProductsService.update.mockResolvedValue({ ...mockProduct, price: 200000 });

      const result = await controller.update(1, dto, mockFile);

      expect(mockProductsService.update).toHaveBeenCalledWith(1, dto, mockFile);
      expect(result.price).toBe(200000);
    });
  });

  // ── updateStatus ─────────────────────────────────────────────────────────
  describe('updateStatus', () => {
    it('Should call service.updateStatus with the correct id and status', async () => {
      mockProductsService.updateStatus.mockResolvedValue({ ...mockProduct, status: 'inactive' });

      const result = await controller.updateStatus(1, 'inactive');

      expect(mockProductsService.updateStatus).toHaveBeenCalledWith(1, 'inactive');
      expect(result.status).toBe('inactive');
    });
  });

  // ── updateStock ──────────────────────────────────────────────────────────
  describe('updateStock', () => {
    it('Should call service.updateStock with the correct id and quantity', async () => {
      mockProductsService.updateStock.mockResolvedValue({ ...mockProduct, stockQuantity: 60 });

      const result = await controller.updateStock(1, 10);

      expect(mockProductsService.updateStock).toHaveBeenCalledWith(1, 10);
      expect(result.stockQuantity).toBe(60);
    });
  });

  // ── remove ───────────────────────────────────────────────────────────────
  describe('remove', () => {
    it('Should call service.remove with the correct id', async () => {
      mockProductsService.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(mockProductsService.remove).toHaveBeenCalledWith(1);
    });
  });
});