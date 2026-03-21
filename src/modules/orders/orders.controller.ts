import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import {
  CheckoutDto,
  CreateOrderDto,
  UpdateOrderStatusDto,
  UpdatePaymentStatusDto,
  QueryOrderDto,
} from './dtos/orders.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from '../rbac/guards/roles.guard';
import {
  ApiCancelOrder,
  ApiCheckoutFromCart,
  ApiCreateOrder,
  ApiGetAllOrders,
  ApiGetMyOrderById,
  ApiGetMyOrders,
  ApiGetOrderById,
  ApiUpdateOrderStatus,
  ApiUpdatePaymentStatus,
} from './swagger/orders.swagger';

// ── Customer routes ────────────────────────────────────────────────────────
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // GET /orders/me
  @Get('me')
  @ApiGetMyOrders()
  getMyOrders(@Req() req: any, @Query() query: QueryOrderDto) {
    return this.ordersService.getMyOrders(req.user.id, query);
  }

  // GET /orders/me/:id
  @Get('me/:id')
  @ApiGetMyOrderById()
  getMyOrderById(
    @Param('id', ParseIntPipe) orderId: number,
    @Req() req: any,
  ) {
    return this.ordersService.getMyOrderById(orderId, req.user.id);
  }

  // POST /orders/checkout  — Order from cart
  @Post('checkout')
  @ApiCheckoutFromCart()
  checkout(@Req() req: any, @Body() dto: CheckoutDto) {
    return this.ordersService.checkout(req.user.id, dto);
  }

  // POST /orders  — Create order directly (without cart)
  @Post()
  @ApiCreateOrder()
  createOrder(@Req() req: any, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(req.user.id, dto);
  }

  // DELETE /orders/:id/cancel  — Customer self-cancel order
  @Delete(':id/cancel')
  @ApiCancelOrder()
  cancelOrder(
    @Param('id', ParseIntPipe) orderId: number,
    @Req() req: any,
  ) {
    return this.ordersService.cancelOrder(orderId, req.user.id);
  }
}

// ── Admin routes ───────────────────────────────────────────────────────────
@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'staff')
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // GET /admin/orders
  @Get()
  @ApiGetAllOrders()
  getAllOrders(@Query() query: QueryOrderDto) {
    return this.ordersService.getAllOrders(query);
  }

  // GET /admin/orders/:id
  @Get(':id')
  @ApiGetOrderById()
  getOrderById(@Param('id', ParseIntPipe) orderId: number) {
    return this.ordersService.getOrderById(orderId);
  }

  // PATCH /admin/orders/:id/status
  @Patch(':id/status')
  @ApiUpdateOrderStatus()
  updateStatus(
    @Param('id', ParseIntPipe) orderId: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(orderId, dto);
  }

  // PATCH /admin/orders/:id/payment
  @Patch(':id/payment')
  @ApiUpdatePaymentStatus()
  updatePayment(
    @Param('id', ParseIntPipe) orderId: number,
    @Body() dto: UpdatePaymentStatusDto,
  ) {
    return this.ordersService.updatePaymentStatus(orderId, dto);
  }
}