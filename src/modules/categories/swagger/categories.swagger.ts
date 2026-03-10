import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiConsumes,
  ApiParam,
} from '@nestjs/swagger';
import { CreateCategoryFormDto } from '../dtos/create-category.dto';
import { CategoryResponseDto } from '../dtos/response-category.dto';

export function ApiFindAllCategories() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all categories' }),
    ApiResponse({ status: HttpStatus.OK, description: 'Return all categories', type: [CategoryResponseDto] }),
  );
}

export function ApiFindOneCategory() {
  return applyDecorators(
    ApiOperation({ summary: 'Get category by ID' }),
    ApiParam({ name: 'id', type: 'number' }),
    ApiResponse({ status: HttpStatus.OK, description: 'Return category record', type: CategoryResponseDto }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Category not found' }),
  );
}

export function ApiCreateCategory() {
  return applyDecorators(
    ApiOperation({ summary: 'Create new category' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({ type: CreateCategoryFormDto }),
    ApiResponse({ status: HttpStatus.CREATED, description: 'Category created successfully', type: CategoryResponseDto }),
  );
}

export function ApiUpdateCategory() {
  return applyDecorators(
    ApiOperation({ summary: 'Update category' }),
    ApiParam({ name: 'id', type: 'number' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({ type: CreateCategoryFormDto }),
    ApiResponse({ status: HttpStatus.OK, description: 'Category updated successfully', type: CategoryResponseDto }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Category not found' }),
  );
}

export function ApiRemoveCategory() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete category' }),
    ApiParam({ name: 'id', type: 'number' }),
    ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Category deleted successfully' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Category not found' }),
  );
}
