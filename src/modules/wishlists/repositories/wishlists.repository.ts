import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Wishlist } from '../entities/wishlist.entity';
import { QueryWishlistDto } from '../dtos/wishlists.dto';

export interface PaginatedWishlist {
  data:       Wishlist[];
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
}

@Injectable()
export class WishlistRepository extends Repository<Wishlist> {
  constructor(private readonly dataSource: DataSource) {
    super(Wishlist, dataSource.createEntityManager());
  }

  async findByUserAndProduct(userId: number, productId: number): Promise<Wishlist | null> {
    return this.findOne({ where: { userId, productId } });
  }

  async findByUserId(userId: number, query: QueryWishlistDto): Promise<PaginatedWishlist> {
    const { page = 1, limit = 10 } = query;

    const [data, total] = await this.findAndCount({
      where:     { userId },
      relations: ['product'],
      order:     { createdAt: 'DESC' },
      skip:      (page - 1) * limit,
      take:      limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async clearByUserId(userId: number): Promise<void> {
    await this.delete({ userId });
  }
}
