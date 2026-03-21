import { ApiProperty } from '@nestjs/swagger';
import { ProductResponseDto } from '../../products/dtos/response-product.dto';

export class CartResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  productId: number;

  @ApiProperty()
  quantity: number;

  @ApiProperty({ type: ProductResponseDto })
  product: ProductResponseDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class CartSummaryResponseDto {
  @ApiProperty({ type: [CartResponseDto] })
  items: CartResponseDto[];

  @ApiProperty()
  totalItems: number;

  @ApiProperty()
  totalQty: number;

  @ApiProperty()
  totalPrice: number;
}

