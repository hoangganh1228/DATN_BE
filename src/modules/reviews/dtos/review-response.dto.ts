import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductResponseDto } from '../../products/dtos/response-product.dto';

export class ReviewUserResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ example: 'Nguyen Van A' })
  fullName: string;

  @ApiPropertyOptional({ required: false, nullable: true })
  avatar: string | null;
}

export class ReviewResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  productId: number;

  @ApiProperty({ example: 5 })
  rating: number;

  @ApiPropertyOptional({ required: false, nullable: true })
  comment: string | null;

  @ApiPropertyOptional({ type: ReviewUserResponseDto, required: false })
  user?: ReviewUserResponseDto;

  @ApiPropertyOptional({ type: ProductResponseDto, required: false })
  product?: ProductResponseDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PaginatedReviewResponseDto {
  @ApiProperty({ type: [ReviewResponseDto] })
  data: ReviewResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty({ example: 4.5 })
  avgRating: number;

  @ApiProperty({
    example: { 1: 0, 2: 1, 3: 2, 4: 6, 5: 10 },
    additionalProperties: { type: 'number' },
  })
  ratingStats: Record<number, number>;
}

