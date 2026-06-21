import { Test, TestingModule } from '@nestjs/testing';
import { WishlistsService } from './wishlists.service';
import { WishlistRepository } from './repositories/wishlists.repository';
import { ProductRepository } from '../products/repositories/product.repository';
import { AppException } from 'src/common/exceptions/app.exception';
import { Wishlist } from './entities/wishlist.entity';
import { Product } from '../products/entities/product.entity';

// Mock data
const mockProduct: Partial<Product> = {
  id:     1,
  name:   'Men T-shirt',
  price:  150000,
  status: 'active',
};

const mockWishlist: Partial<Wishlist> = {
  id:        1,
  userId:    1,
  productId: 1,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const mockPaginatedWishlist = {
  data:       [mockWishlist],
  total:      1,
  page:       1,
  limit:      10,
  totalPages: 1,
};

// ── Mock repositories ──────────────────────────────────────────────────────
const mockWishlistRepo = {
  findByUserAndProduct: jest.fn(),
  findByUserId:         jest.fn(),
  clearByUserId:        jest.fn(),
  create:               jest.fn(),
  save:                 jest.fn(),
  remove:               jest.fn(),
};

const mockProductRepo = {
  findById: jest.fn(),
};

// ── Test Suite ─────────────────────────────────────────────────────────────
describe('WishlistsService', () => {
  let service: WishlistsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WishlistsService,
        { provide: WishlistRepository, useValue: mockWishlistRepo },
        { provide: ProductRepository,  useValue: mockProductRepo },
      ],
    }).compile();

    service = module.get<WishlistsService>(WishlistsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ════════════════════════════════════════════════
  //  getMyWishlist
  // ════════════════════════════════════════════════
  describe('getMyWishlist', () => {
    it('should return paginated wishlist of the user', async () => {
      mockWishlistRepo.findByUserId.mockResolvedValue(mockPaginatedWishlist);

      const result = await service.getMyWishlist(1, { page: 1, limit: 10 });

      expect(mockWishlistRepo.findByUserId).toHaveBeenCalledWith(1, { page: 1, limit: 10 });
      expect(result.total).toBe(1);
      expect(result.data).toHaveLength(1);
    });

    it('should return empty paginated result when wishlist is empty', async () => {
      mockWishlistRepo.findByUserId.mockResolvedValue({
        data: [], total: 0, page: 1, limit: 10, totalPages: 0,
      });

      const result = await service.getMyWishlist(1, {});

      expect(result.total).toBe(0);
    });
  });

  // ════════════════════════════════════════════════
  //  checkInWishlist
  // ════════════════════════════════════════════════
  describe('checkInWishlist', () => {
    it('should return inWishlist = true when item exists', async () => {
      mockWishlistRepo.findByUserAndProduct.mockResolvedValue(mockWishlist);

      const result = await service.checkInWishlist(1, 1);

      expect(mockWishlistRepo.findByUserAndProduct).toHaveBeenCalledWith(1, 1);
      expect(result.inWishlist).toBe(true);
    });

    it('should return inWishlist = false when item does not exist', async () => {
      mockWishlistRepo.findByUserAndProduct.mockResolvedValue(null);

      const result = await service.checkInWishlist(1, 999);

      expect(result.inWishlist).toBe(false);
    });
  });

  // ════════════════════════════════════════════════
  //  addToWishlist
  // ════════════════════════════════════════════════
  describe('addToWishlist', () => {
    const dto = { productId: 1 };

    it('should add a product to wishlist successfully', async () => {
      mockProductRepo.findById.mockResolvedValue(mockProduct);
      mockWishlistRepo.findByUserAndProduct.mockResolvedValue(null);
      mockWishlistRepo.create.mockReturnValue(mockWishlist);
      mockWishlistRepo.save.mockResolvedValue(mockWishlist);

      const result = await service.addToWishlist(1, dto);

      expect(mockProductRepo.findById).toHaveBeenCalledWith(1);
      expect(mockWishlistRepo.findByUserAndProduct).toHaveBeenCalledWith(1, 1);
      expect(mockWishlistRepo.create).toHaveBeenCalledWith({ userId: 1, productId: 1 });
      expect(result).toEqual(mockWishlist);
    });

    it('should throw PRODUCT_NOT_FOUND when the product does not exist', async () => {
      mockProductRepo.findById.mockResolvedValue(null);

      await expect(service.addToWishlist(1, dto)).rejects.toThrow(AppException);
      await expect(service.addToWishlist(1, dto)).rejects.toMatchObject({
        errorCode: 'PRODUCT_001',
      });
    });

    it('should throw WISHLIST_ALREADY_EXISTS when product is already in wishlist', async () => {
      mockProductRepo.findById.mockResolvedValue(mockProduct);
      mockWishlistRepo.findByUserAndProduct.mockResolvedValue(mockWishlist);

      await expect(service.addToWishlist(1, dto)).rejects.toThrow(AppException);
      await expect(service.addToWishlist(1, dto)).rejects.toMatchObject({
        errorCode: 'WISHLIST_002',
      });
    });

    it('should validate product first, then duplicate', async () => {
      mockProductRepo.findById.mockResolvedValue(null);

      await expect(service.addToWishlist(1, dto)).rejects.toThrow(AppException);

      expect(mockWishlistRepo.findByUserAndProduct).not.toHaveBeenCalled();
      expect(mockWishlistRepo.save).not.toHaveBeenCalled();
    });
  });

  // ════════════════════════════════════════════════
  //  removeFromWishlist
  // ════════════════════════════════════════════════
  describe('removeFromWishlist', () => {
    it('should remove a product from wishlist successfully', async () => {
      mockWishlistRepo.findByUserAndProduct.mockResolvedValue(mockWishlist);
      mockWishlistRepo.remove.mockResolvedValue(undefined);

      await service.removeFromWishlist(1, 1);

      expect(mockWishlistRepo.findByUserAndProduct).toHaveBeenCalledWith(1, 1);
      expect(mockWishlistRepo.remove).toHaveBeenCalledWith(mockWishlist);
    });

    it('should throw WISHLIST_NOT_FOUND when item does not exist', async () => {
      mockWishlistRepo.findByUserAndProduct.mockResolvedValue(null);

      await expect(service.removeFromWishlist(1, 999)).rejects.toThrow(AppException);
      await expect(service.removeFromWishlist(1, 999)).rejects.toMatchObject({
        errorCode: 'WISHLIST_001',
      });
      expect(mockWishlistRepo.remove).not.toHaveBeenCalled();
    });
  });

  // ════════════════════════════════════════════════
  //  clearWishlist
  // ════════════════════════════════════════════════
  describe('clearWishlist', () => {
    it('should clear all items in the user wishlist', async () => {
      mockWishlistRepo.clearByUserId.mockResolvedValue(undefined);

      await service.clearWishlist(1);

      expect(mockWishlistRepo.clearByUserId).toHaveBeenCalledWith(1);
    });
  });
});
