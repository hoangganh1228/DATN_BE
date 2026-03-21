import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus, PaymentStatus } from '../entities/orders.entity';

export class OrderItemResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  orderId: number;

  @ApiPropertyOptional({ required: false, nullable: true })
  productId: number | null;

  @ApiProperty({ example: 'Áo thun nam' })
  productName: string;

  @ApiProperty({ example: 150000 })
  unitPrice: number;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: 300000 })
  subtotal: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class OrderResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty({ example: 300000 })
  totalAmount: number;

  @ApiProperty({ enum: ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'] as OrderStatus[] })
  status: OrderStatus;

  @ApiProperty({ example: '123 Nguyen Trai, District 5, HCM' })
  shippingAddress: string;

  @ApiPropertyOptional({ required: false, nullable: true, example: 'COD' })
  paymentMethod: string | null;

  @ApiProperty({ enum: ['unpaid', 'paid', 'refunded'] as PaymentStatus[] })
  paymentStatus: PaymentStatus;

  @ApiPropertyOptional({ required: false, nullable: true, example: 'Giao giờ hành chính' })
  note: string | null;

  @ApiProperty({ type: [OrderItemResponseDto] })
  items: OrderItemResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PaginatedOrdersResponseDto {
  @ApiProperty({ type: [OrderResponseDto] })
  data: OrderResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

