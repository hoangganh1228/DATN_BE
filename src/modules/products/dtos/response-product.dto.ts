import { ApiProperty } from '@nestjs/swagger';
import { CategoryResponseDto } from '../../categories/dtos/response-category.dto';

export class ProductResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  categoryId: number | null;

  @ApiProperty({ type: () => CategoryResponseDto, required: false, nullable: true })
  category: CategoryResponseDto | null;

  @ApiProperty({ example: 'Áo thun nam' })
  name: string;

  @ApiProperty({ example: 'ao-thun-nam' })
  slug: string;

  @ApiProperty({ required: false, nullable: true })
  description: string | null;

  @ApiProperty({ example: 150000 })
  price: number;

  @ApiProperty({ required: false, nullable: true })
  salePrice: number | null;

  @ApiProperty({ example: 50 })
  stockQuantity: number;

  @ApiProperty({ required: false, nullable: true })
  imageUrl: string | null;

  @ApiProperty({ enum: ['active', 'inactive', 'out_of_stock'] })
  status: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PaginatedProductResponseDto {
  @ApiProperty({ type: [ProductResponseDto] })
  data: ProductResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
