import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import {
  CreateReviewDto,
  UpdateReviewDto,
} from '../dtos/reviews.dto';
import {
  PaginatedReviewResponseDto,
  ReviewResponseDto,
} from '../dtos/review-response.dto';

export function ApiGetProductReviews() {
  return applyDecorators(
    ApiOperation({ summary: 'Get reviews by product ID' }),
    ApiParam({ name: 'productId', type: 'number' }),
    ApiQuery({ name: 'rating', required: false, type: 'number', example: 5 }),
    ApiQuery({ name: 'sortBy', required: false, enum: ['rating', 'createdAt'] }),
    ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] }),
    ApiQuery({ name: 'page', required: false, type: 'number', example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: 'number', example: 10 }),
    ApiResponse({ status: HttpStatus.OK, description: 'Paginated product reviews', type: PaginatedReviewResponseDto }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' }),
  );
}

export function ApiGetMyReviews() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get my reviews' }),
    ApiResponse({ status: HttpStatus.OK, description: 'My reviews', type: [ReviewResponseDto] }),
  );
}

export function ApiGetReviewById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get review by ID' }),
    ApiParam({ name: 'id', type: 'number' }),
    ApiResponse({ status: HttpStatus.OK, description: 'Review details', type: ReviewResponseDto }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Review not found' }),
  );
}

export function ApiCreateReview() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create review' }),
    ApiBody({ type: CreateReviewDto }),
    ApiResponse({ status: HttpStatus.CREATED, description: 'Review created', type: ReviewResponseDto }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'User has not purchased this product yet' }),
    ApiResponse({ status: HttpStatus.CONFLICT, description: 'User already reviewed this product' }),
  );
}

export function ApiUpdateReview() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Update my review' }),
    ApiParam({ name: 'id', type: 'number' }),
    ApiBody({ type: UpdateReviewDto }),
    ApiResponse({ status: HttpStatus.OK, description: 'Review updated', type: ReviewResponseDto }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Review not found' }),
  );
}

export function ApiDeleteReview() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Delete my review' }),
    ApiParam({ name: 'id', type: 'number' }),
    ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Review deleted' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Review not found' }),
  );
}

export function ApiAdminDeleteReview() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Admin delete review' }),
    ApiParam({ name: 'id', type: 'number' }),
    ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Review deleted by admin' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Review not found' }),
  );
}

