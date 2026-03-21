import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { ReviewRepository } from './repositories/reviews.repository';
import { ProductRepository } from '../products/repositories/product.repository';
import { AppException } from 'src/common/exceptions/app.exception';
import { Review } from './entitites/reviews.entity';
import { Product } from '../products/entities/product.entity';

// Mock data
const mockProduct: Partial<Product> = {
  id:     1,
  name:   'Men T-shirt',
  price:  150000,
  status: 'active',
};

const mockReview: Partial<Review> = {
  id:        1,
  userId:    1,
  productId: 1,
  rating:    5,
  comment:   'Great product!',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const mockPaginatedReviews = {
  data:        [mockReview],
  total:       1,
  page:        1,
  limit:       10,
  totalPages:  1,
  avgRating:   5.0,
  ratingStats: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1 },
};

// ── Mock repositories ──────────────────────────────────────────────────────
const mockReviewRepo = {
  findById:                   jest.fn(),
  findByIdAndUserId:          jest.fn(),
  findByUserAndProduct:       jest.fn(),
  findByProductId:            jest.fn(),
  findByUserId:               jest.fn(),
  hasUserPurchasedProduct:    jest.fn(),
  create:                     jest.fn(),
  save:                       jest.fn(),
  remove:                     jest.fn(),
};

const mockProductRepo = {
  findById: jest.fn(),
};

// ── Test Suite ─────────────────────────────────────────────────────────────
describe('ReviewsService', () => {
  let service: ReviewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: ReviewRepository,  useValue: mockReviewRepo },
        { provide: ProductRepository, useValue: mockProductRepo },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ════════════════════════════════════════════════
  //  getProductReviews
  // ════════════════════════════════════════════════
  describe('getProductReviews', () => {
    it('should return a list of reviews with avgRating and ratingStats', async () => {
      mockProductRepo.findById.mockResolvedValue(mockProduct);
      mockReviewRepo.findByProductId.mockResolvedValue(mockPaginatedReviews);

      const result = await service.getProductReviews(1, { page: 1, limit: 10 });

      expect(mockProductRepo.findById).toHaveBeenCalledWith(1);
      expect(mockReviewRepo.findByProductId).toHaveBeenCalledWith(1, { page: 1, limit: 10 });
      expect(result.avgRating).toBe(5.0);
      expect(result.ratingStats[5]).toBe(1);
    });

    it('should return an empty list when the product has no reviews', async () => {
      mockProductRepo.findById.mockResolvedValue(mockProduct);
      mockReviewRepo.findByProductId.mockResolvedValue({
        data: [], total: 0, page: 1, limit: 10, totalPages: 0,
        avgRating: 0, ratingStats: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      });

      const result = await service.getProductReviews(1, {});

      expect(result.total).toBe(0);
      expect(result.avgRating).toBe(0);
    });

    it('should throw PRODUCT_NOT_FOUND when the product does not exist', async () => {
      mockProductRepo.findById.mockResolvedValue(null);

      await expect(service.getProductReviews(999, {})).rejects.toThrow(AppException);
      await expect(service.getProductReviews(999, {})).rejects.toMatchObject({
        errorCode: 'PRODUCT_001',
      });
    });
  });

  // ════════════════════════════════════════════════
  //  getMyReviews
  // ════════════════════════════════════════════════
  describe('getMyReviews', () => {
    it('should return a list of the user reviews', async () => {
      mockReviewRepo.findByUserId.mockResolvedValue([mockReview]);

      const result = await service.getMyReviews(1);

      expect(mockReviewRepo.findByUserId).toHaveBeenCalledWith(1);
      expect(result).toHaveLength(1);
    });

    it('should return an empty array when the user has no reviews', async () => {
      mockReviewRepo.findByUserId.mockResolvedValue([]);

      const result = await service.getMyReviews(1);

      expect(result).toHaveLength(0);
    });
  });

  // ════════════════════════════════════════════════
  //  getReviewById
  // ════════════════════════════════════════════════
  describe('getReviewById', () => {
    it('should return the review when found', async () => {
      mockReviewRepo.findById.mockResolvedValue(mockReview);

      const result = await service.getReviewById(1);

      expect(result).toEqual(mockReview);
    });

    it('should throw REVIEW_NOT_FOUND when not found', async () => {
      mockReviewRepo.findById.mockResolvedValue(null);

      await expect(service.getReviewById(999)).rejects.toThrow(AppException);
      await expect(service.getReviewById(999)).rejects.toMatchObject({
        errorCode: 'REVIEW_001',
      });
    });
  });

  // ════════════════════════════════════════════════
  //  createReview
  // ════════════════════════════════════════════════
  describe('createReview', () => {
    const dto = { productId: 1, rating: 5, comment: 'Excellent!' };

    it('should create a review successfully', async () => {
      mockProductRepo.findById.mockResolvedValue(mockProduct);
      mockReviewRepo.hasUserPurchasedProduct.mockResolvedValue(true);
      mockReviewRepo.findByUserAndProduct.mockResolvedValue(null);
      mockReviewRepo.create.mockReturnValue(mockReview);
      mockReviewRepo.save.mockResolvedValue(mockReview);

      const result = await service.createReview(1, dto);

      expect(mockProductRepo.findById).toHaveBeenCalledWith(1);
      expect(mockReviewRepo.hasUserPurchasedProduct).toHaveBeenCalledWith(1, 1);
      expect(mockReviewRepo.findByUserAndProduct).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual(mockReview);
    });

    it('should create a review without comment successfully', async () => {
      mockProductRepo.findById.mockResolvedValue(mockProduct);
      mockReviewRepo.hasUserPurchasedProduct.mockResolvedValue(true);
      mockReviewRepo.findByUserAndProduct.mockResolvedValue(null);
      mockReviewRepo.create.mockReturnValue({ ...mockReview, comment: null });
      mockReviewRepo.save.mockResolvedValue({ ...mockReview, comment: null });

      const result = await service.createReview(1, { productId: 1, rating: 4 });

      expect(mockReviewRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ comment: null }),
      );
      expect(result.comment).toBeNull();
    });

    it('should throw PRODUCT_NOT_FOUND when the product does not exist', async () => {
      mockProductRepo.findById.mockResolvedValue(null);

      await expect(service.createReview(1, dto)).rejects.toMatchObject({
        errorCode: 'PRODUCT_001',
      });
    });

    it('should throw REVIEW_NOT_PURCHASED when the user has not purchased the product', async () => {
      mockProductRepo.findById.mockResolvedValue(mockProduct);
      mockReviewRepo.hasUserPurchasedProduct.mockResolvedValue(false);

      await expect(service.createReview(1, dto)).rejects.toThrow(AppException);
      await expect(service.createReview(1, dto)).rejects.toMatchObject({
        errorCode: 'REVIEW_003',
      });
    });

    it('should throw REVIEW_ALREADY_EXISTS when the user already reviewed this product', async () => {
      mockProductRepo.findById.mockResolvedValue(mockProduct);
      mockReviewRepo.hasUserPurchasedProduct.mockResolvedValue(true);
      mockReviewRepo.findByUserAndProduct.mockResolvedValue(mockReview);

      await expect(service.createReview(1, dto)).rejects.toThrow(AppException);
      await expect(service.createReview(1, dto)).rejects.toMatchObject({
        errorCode: 'REVIEW_002',
      });
    });

    it('should validate in the correct order: product → purchased → duplicate', async () => {
      // If product does not exist, do not check purchased
      mockProductRepo.findById.mockResolvedValue(null);

      await expect(service.createReview(1, dto)).rejects.toThrow(AppException);

      expect(mockReviewRepo.hasUserPurchasedProduct).not.toHaveBeenCalled();
      expect(mockReviewRepo.findByUserAndProduct).not.toHaveBeenCalled();
    });
  });

  // ════════════════════════════════════════════════
  //  updateReview
  // ════════════════════════════════════════════════
  describe('updateReview', () => {
    it('should update rating successfully', async () => {
      mockReviewRepo.findByIdAndUserId.mockResolvedValue({ ...mockReview, rating: 5 });
      mockReviewRepo.save.mockResolvedValue({ ...mockReview, rating: 3 });

      const result = await service.updateReview(1, 1, { rating: 3 });

      expect(result.rating).toBe(3);
    });

    it('should update comment successfully', async () => {
      mockReviewRepo.findByIdAndUserId.mockResolvedValue({ ...mockReview });
      mockReviewRepo.save.mockResolvedValue({ ...mockReview, comment: 'Updated comment' });

      const result = await service.updateReview(1, 1, { comment: 'Updated comment' });

      expect(result.comment).toBe('Updated comment');
    });

    it('should update both rating and comment at the same time', async () => {
      mockReviewRepo.findByIdAndUserId.mockResolvedValue({ ...mockReview });
      mockReviewRepo.save.mockResolvedValue({
        ...mockReview, rating: 2, comment: 'Changed opinion',
      });

      const result = await service.updateReview(1, 1, { rating: 2, comment: 'Changed opinion' });

      expect(result.rating).toBe(2);
      expect(result.comment).toBe('Changed opinion');
    });

    it('should throw REVIEW_NOT_FOUND when the review does not exist', async () => {
      mockReviewRepo.findByIdAndUserId.mockResolvedValue(null);

      await expect(service.updateReview(999, 1, { rating: 4 })).rejects.toMatchObject({
        errorCode: 'REVIEW_001',
      });
    });

    it('should throw REVIEW_NOT_FOUND when user tries to edit someone else review', async () => {
      // findByIdAndUserId filters by userId, so it returns null if not the owner
      mockReviewRepo.findByIdAndUserId.mockResolvedValue(null);

      await expect(service.updateReview(1, 999, { rating: 1 })).rejects.toMatchObject({
        errorCode: 'REVIEW_001',
      });
    });
  });

  // ════════════════════════════════════════════════
  //  deleteReview
  // ════════════════════════════════════════════════
  describe('deleteReview', () => {
    it('should delete own review successfully', async () => {
      mockReviewRepo.findByIdAndUserId.mockResolvedValue(mockReview);
      mockReviewRepo.remove.mockResolvedValue(undefined);

      await service.deleteReview(1, 1, false);

      expect(mockReviewRepo.findByIdAndUserId).toHaveBeenCalledWith(1, 1);
      expect(mockReviewRepo.remove).toHaveBeenCalledWith(mockReview);
    });

    it('should delete any review when isAdmin = true', async () => {
      mockReviewRepo.findById.mockResolvedValue(mockReview);
      mockReviewRepo.remove.mockResolvedValue(undefined);

      await service.deleteReview(1, 99, true);

      // Admin uses findById instead of findByIdAndUserId
      expect(mockReviewRepo.findById).toHaveBeenCalledWith(1);
      expect(mockReviewRepo.findByIdAndUserId).not.toHaveBeenCalled();
      expect(mockReviewRepo.remove).toHaveBeenCalled();
    });

    it('should throw REVIEW_NOT_FOUND when user deletes someone else review', async () => {
      mockReviewRepo.findByIdAndUserId.mockResolvedValue(null);

      await expect(service.deleteReview(1, 999, false)).rejects.toMatchObject({
        errorCode: 'REVIEW_001',
      });
    });

    it('should throw REVIEW_NOT_FOUND when admin deletes a non-existing review', async () => {
      mockReviewRepo.findById.mockResolvedValue(null);

      await expect(service.deleteReview(999, 1, true)).rejects.toMatchObject({
        errorCode: 'REVIEW_001',
      });
    });
  });
});