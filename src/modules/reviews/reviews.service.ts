import { Injectable, HttpStatus } from '@nestjs/common';
import { ReviewRepository } from './repositories/reviews.repository';
import { ProductRepository } from '../products/repositories/product.repository';
import { AppException } from 'src/common/exceptions/app.exception';
import { CreateReviewDto, UpdateReviewDto, QueryReviewDto } from './dtos/reviews.dto';
import { Review } from './entitites/reviews.entity';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly reviewRepo:  ReviewRepository,
    private readonly productRepo: ProductRepository,
  ) {}

  // Get reviews of a product (public)
  async getProductReviews(productId: number, query: QueryReviewDto) {
    // Check if product exists
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw new AppException('PRODUCT_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    return this.reviewRepo.findByProductId(productId, query);
  }

  // Get reviews of the current user
  async getMyReviews(userId: number): Promise<Review[]> {
    return this.reviewRepo.findByUserId(userId);
  }

  // Get details of a review
  async getReviewById(id: number): Promise<Review> {
    const review = await this.reviewRepo.findById(id);
    if (!review) {
      throw new AppException('REVIEW_NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    return review;
  }

  // Create a new review
  async createReview(userId: number, dto: CreateReviewDto): Promise<Review> {
    // Check if product exists
    const product = await this.productRepo.findById(dto.productId);
    if (!product) {
      throw new AppException('PRODUCT_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    // Check if user has purchased the product
    const hasPurchased = await this.reviewRepo.hasUserPurchasedProduct(
      userId,
      dto.productId,
    );
    if (!hasPurchased) {
      throw new AppException('REVIEW_NOT_PURCHASED', HttpStatus.FORBIDDEN);
    }

    // Check if user has already reviewed the product (each user can only review once)
    const existing = await this.reviewRepo.findByUserAndProduct(userId, dto.productId);
    if (existing) {
      throw new AppException('REVIEW_ALREADY_EXISTS', HttpStatus.CONFLICT);
    }

    const review = this.reviewRepo.create({
      userId,
      productId: dto.productId,
      rating:    dto.rating,
      comment:   dto.comment ?? null,
    });

    return this.reviewRepo.save(review);
  }

  // Update a review (only the owner of the review)
  async updateReview(id: number, userId: number, dto: UpdateReviewDto): Promise<Review> {
    const review = await this.reviewRepo.findByIdAndUserId(id, userId);
    if (!review) {
      throw new AppException('REVIEW_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    if (dto.rating  !== undefined) review.rating  = dto.rating;
    if (dto.comment !== undefined) review.comment = dto.comment;

    return this.reviewRepo.save(review);
  }

  // ── Xóa review (chủ review hoặc admin) ───────────────────────────────────
  async deleteReview(id: number, userId: number, isAdmin = false): Promise<void> {
    const review = isAdmin
      ? await this.reviewRepo.findById(id)
      : await this.reviewRepo.findByIdAndUserId(id, userId);

    if (!review) {
      throw new AppException('REVIEW_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    await this.reviewRepo.remove(review);
  }
}