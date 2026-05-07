import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductResponseDto } from '../../products/dtos/response-product.dto';

export class WishlistResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  productId: number;

  @ApiPropertyOptional({ type: ProductResponseDto, required: false })
  product?: ProductResponseDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PaginatedWishlistResponseDto {
  @ApiProperty({ type: [WishlistResponseDto] })
  data: WishlistResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

export class WishlistCheckResponseDto {
  @ApiProperty({ example: true })
  inWishlist: boolean;
}
