import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  IsArray,
  ValidateNested,
  IsPositive,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus, PaymentStatus } from '../entities/orders.entity';

// ── Checkout from cart (entire cart) ──────────────────────────────────────
export class CheckoutDto {
  @ApiProperty({ example: '123 Nguyen Trai, District 5, HCM' })
  @IsString()
  shippingAddress: string;

  @ApiPropertyOptional({ example: 'COD', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  paymentMethod?: string;

  @ApiPropertyOptional({ example: 'Giao giờ hành chính' })
  @IsOptional()
  @IsString()
  note?: string;
}

// ── Create order directly (without cart) ──────────────────────────────────
export class OrderItemDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  productId: number;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ example: '123 Nguyen Trai, District 5, HCM' })
  @IsString()
  shippingAddress: string;

  @ApiPropertyOptional({ example: 'VNPAY', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  paymentMethod?: string;

  @ApiPropertyOptional({ example: 'Giao giờ hành chính' })
  @IsOptional()
  @IsString()
  note?: string;
}

// ── Update order status (admin) ─────────────────────────────────────────────
export class UpdateOrderStatusDto {
  @ApiProperty({ enum: ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'] as OrderStatus[] })
  @IsEnum(['pending', 'confirmed', 'shipping', 'completed', 'cancelled'] as OrderStatus[])
  status: OrderStatus;
}

// ── Update payment status (admin) ────────────────────────────────────────────
export class UpdatePaymentStatusDto {
  @ApiProperty({ enum: ['unpaid', 'paid', 'refunded'] as PaymentStatus[] })
  @IsEnum(['unpaid', 'paid', 'refunded'] as PaymentStatus[])
  paymentStatus: PaymentStatus;
}

// ── Query order ──────────────────────────────────────────────────────────────
export class QueryOrderDto {
  @ApiPropertyOptional({ enum: ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'] as OrderStatus[] })
  @IsOptional()
  @IsEnum(['pending', 'confirmed', 'shipping', 'completed', 'cancelled'] as OrderStatus[])
  status?: OrderStatus;

  @ApiPropertyOptional({ enum: ['unpaid', 'paid', 'refunded'] as PaymentStatus[] })
  @IsOptional()
  @IsEnum(['unpaid', 'paid', 'refunded'] as PaymentStatus[])
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;
}