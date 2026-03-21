import { Injectable, HttpStatus } from '@nestjs/common';
import { CartRepository } from './repositories/cart.repository';
import { ProductRepository } from '../products/repositories/product.repository';
import { AppException } from 'src/common/exceptions/app.exception';
import { AddToCartDto, UpdateCartDto } from './dtos/cart.dto';
import { Cart } from './entities/cart.entity';

export interface CartSummary {
  items:      Cart[];
  totalItems: number;      
  totalQty:   number;      
  totalPrice: number;      
}

@Injectable()
export class CartsService {
  constructor(
    private readonly cartRepo:    CartRepository,
    private readonly productRepo: ProductRepository,
  ) {}

  async getCart(userId: number): Promise<CartSummary> {
    const items = await this.cartRepo.findByUserId(userId);

    const totalQty   = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => {
      const price = item.product.salePrice ?? item.product.price;
      return sum + Number(price) * item.quantity;
    }, 0);

    return {
      items,
      totalItems: items.length,
      totalQty,
      totalPrice: Math.round(totalPrice * 100) / 100,
    };
  }

  async addToCart(userId: number, dto: AddToCartDto): Promise<Cart> {
    // 1. Check if product exists
    const product = await this.productRepo.findById(dto.productId);
    if (!product) {
      throw new AppException('PRODUCT_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    // 2. Check if product is active
    if (product.status === 'inactive') {
      throw new AppException('PRODUCT_INACTIVE', HttpStatus.BAD_REQUEST);
    }

    // 3. Check if product is out of stock
    if (product.status === 'out_of_stock' || product.stockQuantity === 0) {
      throw new AppException('PRODUCT_OUT_OF_STOCK', HttpStatus.BAD_REQUEST);
    }

    // 4. If product already in cart, update quantity
    const existing = await this.cartRepo.findCartItem(userId, dto.productId);
    if (existing) {
      const newQty = existing.quantity + dto.quantity;

      // Check if quantity is not greater than stock quantity
      if (newQty > product.stockQuantity) {
        throw new AppException('INSUFFICIENT_STOCK', HttpStatus.BAD_REQUEST);
      }

      existing.quantity = newQty;
      return this.cartRepo.save(existing);
    }

    // 5. Check if quantity is not greater than stock quantity
    if (dto.quantity > product.stockQuantity) {
      throw new AppException('INSUFFICIENT_STOCK', HttpStatus.BAD_REQUEST);
    }

    // 6. Add new product to cart
    const cartItem = this.cartRepo.create({
      userId,
      productId: dto.productId,
      quantity:  dto.quantity,
    });

    return this.cartRepo.save(cartItem);
  }

  async updateQuantity(
    cartId: number,
    userId: number,
    dto:    UpdateCartDto,
  ): Promise<Cart> {
    const cartItem = await this.cartRepo.findCartItemById(cartId, userId);
    if (!cartItem) {
      throw new AppException('CART_ITEM_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const product = await this.productRepo.findById(cartItem.productId);
    if (!product) {
      throw new AppException('PRODUCT_NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    if (dto.quantity > product.stockQuantity) {
      throw new AppException('INSUFFICIENT_STOCK', HttpStatus.BAD_REQUEST);
    }

    cartItem.quantity = dto.quantity;
    return this.cartRepo.save(cartItem);
  }

  async removeItem(cartId: number, userId: number): Promise<void> {
    const cartItem = await this.cartRepo.findCartItemById(cartId, userId);
    if (!cartItem) {
      throw new AppException('CART_ITEM_NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    await this.cartRepo.remove(cartItem);
  }

  async clearCart(userId: number): Promise<void> {
    const count = await this.cartRepo.countItems(userId);
    if (count === 0) {
      throw new AppException('CART_EMPTY', HttpStatus.BAD_REQUEST);
    }
    await this.cartRepo.clearCart(userId);
  }
}