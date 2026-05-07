import { Test, TestingModule } from '@nestjs/testing';
import { WishlistsController } from './wishlists.controller';
import { WishlistsService } from './wishlists.service';
import { Wishlist } from './entities/wishlist.entity';

// Mock data
const mockWishlist: Partial<Wishlist> = {
  id:        1,
  userId:    1,
  productId: 1,
};

const mockPaginatedWishlist = {
  data:       [mockWishlist],
  total:      1,
  page:       1,
  limit:      10,
  totalPages: 1,
};

const mockReq = { user: { id: 1 } };

// Mock service
const mockWishlistsService = {
  getMyWishlist:       jest.fn(),
  checkInWishlist:     jest.fn(),
  addToWishlist:       jest.fn(),
  removeFromWishlist:  jest.fn(),
  clearWishlist:       jest.fn(),
};

// ── Test Suite ─────────────────────────────────────────────────────────────
describe('WishlistsController', () => {
  let controller: WishlistsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WishlistsController],
      providers: [{ provide: WishlistsService, useValue: mockWishlistsService }],
    }).compile();

    controller = module.get<WishlistsController>(WishlistsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ── getMyWishlist ────────────────────────────────────────────────────────
  describe('getMyWishlist', () => {
    it('should call service.getMyWishlist with userId from JWT and query', async () => {
      const query = { page: 1, limit: 10 };
      mockWishlistsService.getMyWishlist.mockResolvedValue(mockPaginatedWishlist);

      const result = await controller.getMyWishlist(mockReq, query);

      expect(mockWishlistsService.getMyWishlist).toHaveBeenCalledWith(1, query);
      expect(result.total).toBe(1);
      expect(result.data).toHaveLength(1);
    });

    it('should return empty paginated result', async () => {
      const query = { page: 1, limit: 10 };
      mockWishlistsService.getMyWishlist.mockResolvedValue({
        data: [], total: 0, page: 1, limit: 10, totalPages: 0,
      });

      const result = await controller.getMyWishlist(mockReq, query);

      expect(result.total).toBe(0);
      expect(result.data).toHaveLength(0);
    });
  });

  // ── checkInWishlist ──────────────────────────────────────────────────────
  describe('checkInWishlist', () => {
    it('should return inWishlist = true when product is in wishlist', async () => {
      mockWishlistsService.checkInWishlist.mockResolvedValue({ inWishlist: true });

      const result = await controller.checkInWishlist(mockReq, 1);

      expect(mockWishlistsService.checkInWishlist).toHaveBeenCalledWith(1, 1);
      expect(result.inWishlist).toBe(true);
    });

    it('should return inWishlist = false when product is not in wishlist', async () => {
      mockWishlistsService.checkInWishlist.mockResolvedValue({ inWishlist: false });

      const result = await controller.checkInWishlist(mockReq, 999);

      expect(result.inWishlist).toBe(false);
    });
  });

  // ── addToWishlist ────────────────────────────────────────────────────────
  describe('addToWishlist', () => {
    it('should call service.addToWishlist with userId and dto', async () => {
      const dto = { productId: 1 };
      mockWishlistsService.addToWishlist.mockResolvedValue(mockWishlist);

      const result = await controller.addToWishlist(mockReq, dto);

      expect(mockWishlistsService.addToWishlist).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(mockWishlist);
    });
  });

  // ── removeFromWishlist ───────────────────────────────────────────────────
  describe('removeFromWishlist', () => {
    it('should call service.removeFromWishlist with userId and productId', async () => {
      mockWishlistsService.removeFromWishlist.mockResolvedValue(undefined);

      await controller.removeFromWishlist(mockReq, 1);

      expect(mockWishlistsService.removeFromWishlist).toHaveBeenCalledWith(1, 1);
    });
  });

  // ── clearWishlist ────────────────────────────────────────────────────────
  describe('clearWishlist', () => {
    it('should call service.clearWishlist with userId from JWT', async () => {
      mockWishlistsService.clearWishlist.mockResolvedValue(undefined);

      await controller.clearWishlist(mockReq);

      expect(mockWishlistsService.clearWishlist).toHaveBeenCalledWith(1);
    });
  });
});
