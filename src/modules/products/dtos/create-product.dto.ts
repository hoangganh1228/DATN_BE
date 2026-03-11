import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  IsPositive,
  IsEnum,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductStatus } from '../entities/product.entity';

export class CreateProductDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  categoryId?: number;

  @ApiProperty({ example: 'Áo thun nam' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 150000 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional({ example: 120000 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  salePrice?: number;

  @ApiProperty({ example: 50 })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  stockQuantity: number;

  @ApiPropertyOptional({ enum: ['active', 'inactive', 'out_of_stock'] })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'out_of_stock'] as ProductStatus[])
  status?: ProductStatus;
}

/** DTO for Swagger multipart/form-data (body + file) */
export class CreateProductFormDto extends CreateProductDto {
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  image?: any;
}