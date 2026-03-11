import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}

/** DTO cho Swagger multipart/form-data khi update (body + file) */
export class UpdateProductFormDto extends UpdateProductDto {
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  image?: any;
}