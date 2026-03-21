import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import {
  CheckoutDto,
  CreateOrderDto,
  QueryOrderDto,
  UpdateOrderStatusDto,
  UpdatePaymentStatusDto,
} from '../dtos/orders.dto';
import {
  OrderResponseDto,
  PaginatedOrdersResponseDto,
} from '../dtos/order-response.dto';

export function ApiGetMyOrders() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get my orders (customer)' }),
    ApiQuery({ name: 'status', required: false, enum: ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'] }),
    ApiQuery({ name: 'paymentStatus', required: false, enum: ['unpaid', 'paid', 'refunded'] }),
    ApiQuery({ name: 'page', required: false, type: 'number', example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: 'number', example: 10 }),
    ApiResponse({ status: HttpStatus.OK, description: 'Paginated list of orders', type: PaginatedOrdersResponseDto }),
  );
}

export function ApiGetMyOrderById() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get my order by ID (customer)' }),
    ApiParam({ name: 'id', type: 'number' }),
    ApiResponse({ status: HttpStatus.OK, description: 'Order details', type: OrderResponseDto }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found' }),
  );
}

export function ApiCheckoutFromCart() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Checkout from cart and create order' }),
    ApiBody({ type: CheckoutDto }),
    ApiResponse({ status: HttpStatus.CREATED, description: 'Order created successfully', type: OrderResponseDto }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Cart empty / product inactive / insufficient stock' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' }),
  );
}

export function ApiCreateOrder() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create order directly (without cart)' }),
    ApiBody({ type: CreateOrderDto }),
    ApiResponse({ status: HttpStatus.CREATED, description: 'Order created successfully', type: OrderResponseDto }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Product inactive / insufficient stock' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' }),
  );
}

export function ApiCancelOrder() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Cancel my order' }),
    ApiParam({ name: 'id', type: 'number' }),
    ApiResponse({ status: HttpStatus.OK, description: 'Order cancelled', type: OrderResponseDto }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found' }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Order cannot be cancelled in current state' }),
  );
}

export function ApiGetAllOrders() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get all orders (admin/staff)' }),
    ApiQuery({ name: 'status', required: false, enum: ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'] }),
    ApiQuery({ name: 'paymentStatus', required: false, enum: ['unpaid', 'paid', 'refunded'] }),
    ApiQuery({ name: 'page', required: false, type: 'number', example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: 'number', example: 10 }),
    ApiResponse({ status: HttpStatus.OK, description: 'Paginated list of orders', type: PaginatedOrdersResponseDto }),
  );
}

export function ApiGetOrderById() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get order by ID (admin/staff)' }),
    ApiParam({ name: 'id', type: 'number' }),
    ApiResponse({ status: HttpStatus.OK, description: 'Order details', type: OrderResponseDto }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found' }),
  );
}

export function ApiUpdateOrderStatus() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Update order status (admin)' }),
    ApiParam({ name: 'id', type: 'number' }),
    ApiBody({ type: UpdateOrderStatusDto }),
    ApiResponse({ status: HttpStatus.OK, description: 'Order updated', type: OrderResponseDto }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found' }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Order cannot transition to this status' }),
  );
}

export function ApiUpdatePaymentStatus() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Update payment status (admin)' }),
    ApiParam({ name: 'id', type: 'number' }),
    ApiBody({ type: UpdatePaymentStatusDto }),
    ApiResponse({ status: HttpStatus.OK, description: 'Payment status updated', type: OrderResponseDto }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found' }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Order cannot be paid/refunded in current state' }),
    ApiResponse({ status: HttpStatus.CONFLICT, description: 'Order already paid' }),
  );
}

