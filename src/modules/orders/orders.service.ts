import { Injectable, HttpStatus } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OrderRepository } from './repositories/orders.repositories';
import { CartRepository } from '../carts/repositories/cart.repository';
import { ProductRepository } from '../products/repositories/product.repository';
import { AppException } from 'src/common/exceptions/app.exception';
import {
  CheckoutDto,
  CreateOrderDto,
  UpdateOrderStatusDto,
  UpdatePaymentStatusDto,
  QueryOrderDto,
} from './dtos/orders.dto';
import { Order, ORDER_STATUS_TRANSITIONS } from './entities/orders.entity';
import { OrderItem } from './entities/orders-item.entity';

@Injectable()
export class OrdersService {
  constructor(
    private readonly orderRepo:   OrderRepository,
    private readonly cartRepo:    CartRepository,
    private readonly productRepo: ProductRepository,
    private readonly dataSource:  DataSource,
  ) {}

  // ── Get orders of the current user ──────────────────────────────────────────
  async getMyOrders(userId: number, query: QueryOrderDto) {
    return this.orderRepo.findByUserId(userId, query);
  }

  // ── Get order details (customer only view their own) ───────────────────────
  async getMyOrderById(orderId: number, userId: number): Promise<Order> {
    const order = await this.orderRepo.findByIdAndUserId(orderId, userId);
    if (!order) throw new AppException('ORDER_NOT_FOUND', HttpStatus.NOT_FOUND);
    return order;
  }

  // ── Get all orders (admin) ──────────────────────────────────────────────────
  async getAllOrders(query: QueryOrderDto) {
    return this.orderRepo.findAll(query);
  }

  // ── Get order details (admin) ───────────────────────────────────────────────
  async getOrderById(orderId: number): Promise<Order> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) throw new AppException('ORDER_NOT_FOUND', HttpStatus.NOT_FOUND);
    return order;
  }

  // ── Checkout from cart ──────────────────────────────────────────────────────
  async checkout(userId: number, dto: CheckoutDto): Promise<Order> {
    const cartItems = await this.cartRepo.findByUserId(userId);

    if (!cartItems.length) {
      throw new AppException('CART_EMPTY', HttpStatus.BAD_REQUEST);
    }

    // Use transaction: either all succeed or rollback everything
    return this.dataSource.transaction(async (manager) => {
      let totalAmount = 0;
      const orderItems: Partial<OrderItem>[] = [];

      for (const cartItem of cartItems) {
        const product = await this.productRepo.findById(cartItem.productId);

        // Check each product in the cart
        if (!product || product.status === 'inactive') {
          throw new AppException('PRODUCT_INACTIVE', HttpStatus.BAD_REQUEST);
        }
        if (product.stockQuantity < cartItem.quantity) {
          throw new AppException('INSUFFICIENT_STOCK', HttpStatus.BAD_REQUEST);
        }

        const unitPrice = Number(product.salePrice ?? product.price);
        const subtotal  = unitPrice * cartItem.quantity;
        totalAmount    += subtotal;

        // Snapshot product information
        orderItems.push({
          productId:   product.id,
          productName: product.name,
          unitPrice,
          quantity:    cartItem.quantity,
          subtotal,
        });

        // Subtract stock quantity
        product.stockQuantity -= cartItem.quantity;
        if (product.stockQuantity === 0) product.status = 'out_of_stock';
        await manager.save(product);
      }

      // Create order
      const order = manager.create(Order, {
        userId,
        totalAmount:     Math.round(totalAmount * 100) / 100,
        status:          'pending',
        shippingAddress: dto.shippingAddress,
        paymentMethod:   dto.paymentMethod ?? null,
        paymentStatus:   'unpaid',
        note:            dto.note ?? null,
        items:           orderItems as OrderItem[],
      });

      const saved = await manager.save(order);

      // Clear cart after successful checkout
      await this.cartRepo.clearCart(userId);

      return saved;
    });
  }

  // ── Create order directly (without cart) ───────────────────────────────────
  async createOrder(userId: number, dto: CreateOrderDto): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      let totalAmount = 0;
      const orderItems: Partial<OrderItem>[] = [];

      for (const item of dto.items) {
        const product = await this.productRepo.findById(item.productId);

        if (!product) {
          throw new AppException('PRODUCT_NOT_FOUND', HttpStatus.NOT_FOUND);
        }
        if (product.status === 'inactive') {
          throw new AppException('PRODUCT_INACTIVE', HttpStatus.BAD_REQUEST);
        }
        if (product.stockQuantity < item.quantity) {
          throw new AppException('INSUFFICIENT_STOCK', HttpStatus.BAD_REQUEST);
        }

        const unitPrice = Number(product.salePrice ?? product.price);
        const subtotal  = unitPrice * item.quantity;
        totalAmount    += subtotal;

        orderItems.push({
          productId:   product.id,
          productName: product.name,
          unitPrice,
          quantity:    item.quantity,
          subtotal,
        });

        product.stockQuantity -= item.quantity;
        if (product.stockQuantity === 0) product.status = 'out_of_stock';
        await manager.save(product);
      }

      const order = manager.create(Order, {
        userId,
        totalAmount:     Math.round(totalAmount * 100) / 100,
        status:          'pending',
        shippingAddress: dto.shippingAddress,
        paymentMethod:   dto.paymentMethod ?? null,
        paymentStatus:   'unpaid',
        note:            dto.note ?? null,
        items:           orderItems as OrderItem[],
      });

      return manager.save(order);
    });
  }

  // ── Update order status (admin) ─────────────────────────────────────────────
  async updateOrderStatus(orderId: number, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.getOrderById(orderId);

    const allowed = ORDER_STATUS_TRANSITIONS[order.status];
    if (!allowed.includes(dto.status)) {
      throw new AppException('ORDER_CANNOT_CANCEL', HttpStatus.BAD_REQUEST);
    }

    order.status = dto.status;
    return this.orderRepo.save(order);
  }

  // ── Update payment status (admin) ────────────────────────────────────────────
  async updatePaymentStatus(orderId: number, dto: UpdatePaymentStatusDto): Promise<Order> {
    const order = await this.getOrderById(orderId);

    // Do not allow updating payment status when order is cancelled
    if (order.status === 'cancelled') {
      throw new AppException('ORDER_CANNOT_CANCEL', HttpStatus.BAD_REQUEST);
    }

    // Do not update if already paid
    if (order.paymentStatus === 'paid' && dto.paymentStatus === 'paid') {
      throw new AppException('ORDER_ALREADY_PAID', HttpStatus.CONFLICT);
    }

    order.paymentStatus = dto.paymentStatus;
    return this.orderRepo.save(order);
  }

  // ── Cancel order (customer self-cancel) ────────────────────────────────────
  async cancelOrder(orderId: number, userId: number): Promise<Order> {
    const order = await this.getMyOrderById(orderId, userId);

    const allowed = ORDER_STATUS_TRANSITIONS[order.status];
    if (!allowed.includes('cancelled')) {
      throw new AppException('ORDER_CANNOT_CANCEL', HttpStatus.BAD_REQUEST);
    }

    // Restore stock quantity when cancelled
    return this.dataSource.transaction(async (manager) => {
      for (const item of order.items) {
        if (item.productId) {
          const product = await this.productRepo.findById(item.productId);
          if (product) {
            product.stockQuantity += item.quantity;
            if (product.status === 'out_of_stock' && product.stockQuantity > 0) {
              product.status = 'active';
            }
            await manager.save(product);
          }
        }
      }

      order.status = 'cancelled';
      return manager.save(order);
    });
  }
}