import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { AddToCartDto, UpdateCartDto } from '../dtos/cart.dto';
import { CartResponseDto, CartSummaryResponseDto } from '../dtos/cart-response.dto';

export function ApiGetCart() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get current user cart' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Cart summary',
      type: CartSummaryResponseDto,
    }),
  );
}

export function ApiAddToCart() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Add product to cart' }),
    ApiBody({ type: AddToCartDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Cart item created/updated',
      type: CartResponseDto,
    }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Product inactive/out of stock or insufficient stock' }),
  );
}

export function ApiUpdateCartQuantity() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Update cart item quantity' }),
    ApiParam({ name: 'id', type: 'number' }),
    ApiBody({ type: UpdateCartDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Cart item updated',
      type: CartResponseDto,
    }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Cart item not found' }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Insufficient stock' }),
  );
}

export function ApiRemoveCartItem() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Remove cart item' }),
    ApiParam({ name: 'id', type: 'number' }),
    ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Cart item removed' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Cart item not found' }),
  );
}

export function ApiClearCart() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Clear user cart' }),
    ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Cart cleared' }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Cart is empty' }),
  );
}

