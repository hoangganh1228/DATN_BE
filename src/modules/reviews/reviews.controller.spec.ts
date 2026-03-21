import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { Review } from './entitites/reviews.entity';

// Mock data
const mockReview: Partial<Review> = {
  id:        1,
  userId:    1,
  productId: 1,
  rating:    5,
  comment:   'Great product!',
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

const mockReq = { user: { id: 1 } };

// Mock service
const mockReviewsService = {
  getProductReviews: jest.fn(),
  getMyReviews:      jest.fn(),
  getReviewById:     jest.fn(),
  createReview:      jest.fn(),
  updateReview:      jest.fn(),
  deleteReview:      jest.fn(),
};

// ── Test Suite ─────────────────────────────────────────────────────────────
describe('ReviewsController', () => {
  let controller: ReviewsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [{ provide: ReviewsService, useValue: mockReviewsService }],
    }).compile();

    controller = module.get<ReviewsController>(ReviewsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ── getProductReviews ────────────────────────────────────────────────────
  describe('getProductReviews', () => {
    it('should call service.getProductReviews with the correct productId and query', async () => {
      const query = { page: 1, limit: 10 };
      mockReviewsService.getProductReviews.mockResolvedValue(mockPaginatedReviews);

      const result = await controller.getProductReviews(1, query);

      expect(mockReviewsService.getProductReviews).toHaveBeenCalledWith(1, query);
      expect(result.avgRating).toBe(5.0);
      expect(result.ratingStats[5]).toBe(1);
    });

    it('should filter by rating', async () => {
      const query = { rating: 5, page: 1, limit: 10 };
      mockReviewsService.getProductReviews.mockResolvedValue(mockPaginatedReviews);

      await controller.getProductReviews(1, query);

      expect(mockReviewsService.getProductReviews).toHaveBeenCalledWith(1, query);
    });
  });

  // ── getMyReviews ─────────────────────────────────────────────────────────
  describe('getMyReviews', () => {
    it('should call service.getMyReviews with userId from JWT', async () => {
      mockReviewsService.getMyReviews.mockResolvedValue([mockReview]);

      const result = await controller.getMyReviews(mockReq);

      expect(mockReviewsService.getMyReviews).toHaveBeenCalledWith(1);
      expect(result).toHaveLength(1);
    });
  });

  // ── getReviewById ────────────────────────────────────────────────────────
  describe('getReviewById', () => {
    it('should call service.getReviewById with the correct id', async () => {
      mockReviewsService.getReviewById.mockResolvedValue(mockReview);

      const result = await controller.getReviewById(1);

      expect(mockReviewsService.getReviewById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockReview);
    });
  });

  // ── createReview ─────────────────────────────────────────────────────────
  describe('createReview', () => {
    it('should call service.createReview with userId and dto', async () => {
      const dto = { productId: 1, rating: 5, comment: 'Excellent!' };
      mockReviewsService.createReview.mockResolvedValue(mockReview);

      const result = await controller.createReview(mockReq, dto);

      expect(mockReviewsService.createReview).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(mockReview);
    });

    it('should call service.createReview without comment', async () => {
      const dto = { productId: 1, rating: 4 };
      mockReviewsService.createReview.mockResolvedValue({ ...mockReview, comment: null });

      const result = await controller.createReview(mockReq, dto);

      expect(mockReviewsService.createReview).toHaveBeenCalledWith(1, dto);
      expect(result.comment).toBeNull();
    });
  });

  // ── updateReview ─────────────────────────────────────────────────────────
  describe('updateReview', () => {
    it('should call service.updateReview with the correct id, userId, and dto', async () => {
      const dto = { rating: 3, comment: 'Average' };
      mockReviewsService.updateReview.mockResolvedValue({ ...mockReview, ...dto });

      const result = await controller.updateReview(1, mockReq, dto);

      expect(mockReviewsService.updateReview).toHaveBeenCalledWith(1, 1, dto);
      expect(result.rating).toBe(3);
    });
  });

  // ── deleteReview ─────────────────────────────────────────────────────────
  describe('deleteReview', () => {
    it('should call service.deleteReview with isAdmin = false', async () => {
      mockReviewsService.deleteReview.mockResolvedValue(undefined);

      await controller.deleteReview(1, mockReq);

      expect(mockReviewsService.deleteReview).toHaveBeenCalledWith(1, 1, false);
    });
  });

  // ── adminDeleteReview ────────────────────────────────────────────────────
  describe('adminDeleteReview', () => {
    it('should call service.deleteReview with isAdmin = true', async () => {
      mockReviewsService.deleteReview.mockResolvedValue(undefined);

      await controller.adminDeleteReview(1, mockReq);

      expect(mockReviewsService.deleteReview).toHaveBeenCalledWith(1, 1, true);
    });
  });
});