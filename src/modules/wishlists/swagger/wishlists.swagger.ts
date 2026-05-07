import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateWishlistDto } from '../dtos/wishlists.dto';
import {
  PaginatedWishlistResponseDto,
  WishlistCheckResponseDto,
  WishlistResponseDto,
} from '../dtos/wishlist-response.dto';

export function ApiGetMyWishlist() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get my wishlist (paginated)' }),
    ApiQuery({ name: 'page', required: false, type: 'number', example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: 'number', example: 10 }),
    ApiResponse({ status: HttpStatus.OK, description: 'Paginated wishlist', type: PaginatedWishlistResponseDto }),
  );
}

export function ApiCheckWishlist() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Check if a product is in my wishlist' }),
    ApiParam({ name: 'productId', type: 'number' }),
    ApiResponse({ status: HttpStatus.OK, description: 'Product wishlist status', type: WishlistCheckResponseDto }),
  );
}

export function ApiAddToWishlist() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Add a product to my wishlist' }),
    ApiBody({ type: CreateWishlistDto }),
    ApiResponse({ status: HttpStatus.CREATED, description: 'Product added to wishlist', type: WishlistResponseDto }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' }),
    ApiResponse({ status: HttpStatus.CONFLICT, description: 'Product already in wishlist' }),
  );
}

export function ApiRemoveFromWishlist() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Remove a product from my wishlist' }),
    ApiParam({ name: 'productId', type: 'number' }),
    ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Product removed from wishlist' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found in wishlist' }),
  );
}

export function ApiClearWishlist() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Clear my entire wishlist' }),
    ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Wishlist cleared' }),
  );
}
