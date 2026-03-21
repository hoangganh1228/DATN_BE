import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Cart } from '../entities/cart.entity';

@Injectable()
export class CartRepository extends Repository<Cart> {
  constructor(private readonly dataSource: DataSource) {
    super(Cart, dataSource.createEntityManager());
  }

  async findByUserId(userId: number): Promise<Cart[]> {
    return this.find({
      where: { userId },
      relations: ['product', 'product.category'],
      order: { createdAt: 'DESC' },
    });
  }

  async findCartItem(userId: number, productId: number): Promise<Cart | null> {
    return this.findOne({
      where: { userId, productId },
      relations: ['product'],
    });
  }

  async findCartItemById(cartId: number, userId: number): Promise<Cart | null> {
    return this.findOne({
      where: { id: cartId, userId },
      relations: ['product'],
    });
  }

  async countItems(userId: number): Promise<number> {
    return this.count({ where: { userId } });
  }

  async clearCart(userId: number): Promise<void> {
    await this.delete({ userId });
  }
}