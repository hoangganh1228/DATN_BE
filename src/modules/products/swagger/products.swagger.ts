import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiConsumes,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateProductFormDto } from '../dtos/create-product.dto';
import { UpdateProductFormDto } from '../dtos/update-product.dto';
import {
  ProductResponseDto,
  PaginatedProductResponseDto,
} from '../dtos/response-product.dto';

export function ApiFindAllProducts() {
  return applyDecorators(
    ApiOperation({ summary: 'Get products with filters and pagination' }),
    ApiQuery({ name: 'search', required: false }),
    ApiQuery({ name: 'categoryId', required: false }),
    ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive', 'out_of_stock'] }),
    ApiQuery({ name: 'minPrice', required: false }),
    ApiQuery({ name: 'maxPrice', required: false }),
    ApiQuery({ name: 'page', required: false }),
    ApiQuery({ name: 'limit', required: false }),
    ApiQuery({ name: 'sortBy', required: false, enum: ['price', 'name', 'createdAt', 'stockQuantity'] }),
    ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] }),
    ApiResponse({ status: HttpStatus.OK, description: 'Paginated list of products', type: PaginatedProductResponseDto }),
  );
}

export function ApiFindOneProduct() {
  return applyDecorators(
    ApiOperation({ summary: 'Get product by ID' }),
    ApiParam({ name: 'id', type: 'number' }),
    ApiResponse({ status: HttpStatus.OK, description: 'Product record', type: ProductResponseDto }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' }),
  );
}

export function ApiFindProductBySlug() {
  return applyDecorators(
    ApiOperation({ summary: 'Get product by slug' }),
    ApiParam({ name: 'slug', type: 'string' }),
    ApiResponse({ status: HttpStatus.OK, description: 'Product record', type: ProductResponseDto }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' }),
  );
}

export function ApiCreateProduct() {
  return applyDecorators(
    ApiOperation({ summary: 'Create new product' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({ type: CreateProductFormDto }),
    ApiResponse({ status: HttpStatus.CREATED, description: 'Product created successfully', type: ProductResponseDto }),
  );
}

export function ApiUpdateProduct() {
  return applyDecorators(
    ApiOperation({ summary: 'Update product' }),
    ApiParam({ name: 'id', type: 'number' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({ type: UpdateProductFormDto }),
    ApiResponse({ status: HttpStatus.OK, description: 'Product updated successfully', type: ProductResponseDto }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' }),
  );
}

export function ApiUpdateProductStatus() {
  return applyDecorators(
    ApiOperation({ summary: 'Update product status' }),
    ApiParam({ name: 'id', type: 'number' }),
    ApiBody({
      schema: {
        type: 'object',
        properties: { status: { type: 'string', enum: ['active', 'inactive', 'out_of_stock'] } },
        required: ['status'],
      },
    }),
    ApiResponse({ status: HttpStatus.OK, description: 'Status updated', type: ProductResponseDto }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' }),
  );
}

export function ApiUpdateProductStock() {
  return applyDecorators(
    ApiOperation({ summary: 'Update product stock quantity' }),
    ApiParam({ name: 'id', type: 'number' }),
    ApiBody({
      schema: {
        type: 'object',
        properties: { quantity: { type: 'number' } },
        required: ['quantity'],
      },
    }),
    ApiResponse({ status: HttpStatus.OK, description: 'Stock updated', type: ProductResponseDto }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' }),
  );
}

export function ApiRemoveProduct() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete product' }),
    ApiParam({ name: 'id', type: 'number' }),
    ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Product deleted successfully' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' }),
  );
}
