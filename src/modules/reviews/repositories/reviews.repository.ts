import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Review } from '../entitites/reviews.entity';
import { QueryReviewDto } from '../dtos/reviews.dto';

export interface PaginatedReviews {
  data:        Review[];
  total:       number;
  page:        number;
  limit:       number;
  totalPages:  number;
  avgRating:   number;
  ratingStats: Record<number, number>; // { 1: 0, 2: 1, 3: 5, 4: 10, 5: 20 }
}

@Injectable()
export class ReviewRepository extends Repository<Review> {
  constructor(private readonly dataSource: DataSource) {
    super(Review, dataSource.createEntityManager());
  }

  async findById(id: number): Promise<Review | null> {
    return this.findOne({
      where:     { id },
      relations: ['user', 'product'],
    });
  }

  async findByIdAndUserId(id: number, userId: number): Promise<Review | null> {
    return this.findOne({ where: { id, userId } });
  }

  async findByUserAndProduct(userId: number, productId: number): Promise<Review | null> {
    return this.findOne({ where: { userId, productId } });
  }

  // Get reviews of a product with rating statistics
  async findByProductId(
    productId: number,
    query:     QueryReviewDto,
  ): Promise<PaginatedReviews> {
    const {
      rating,
      sortBy    = 'createdAt',
      sortOrder = 'DESC',
      page      = 1,
      limit     = 10,
    } = query;

    const qb = this.createQueryBuilder('r')
      .leftJoinAndSelect('r.user', 'user')
      .where('r.productId = :productId', { productId })
      .select([
        'r',
        'user.id',
        'user.fullName',
        'user.avatar',
      ]);

    if (rating) qb.andWhere('r.rating = :rating', { rating });

    const allowedSort = ['rating', 'createdAt'];
    const orderField  = allowedSort.includes(sortBy) ? sortBy : 'createdAt';
    qb.orderBy(`r.${orderField}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    // Calculate avgRating and ratingStats from all reviews (not affected by filter)
    const stats = await this.createQueryBuilder('r')
      .select('r.rating', 'rating')
      .addSelect('COUNT(*)', 'count')
      .where('r.productId = :productId', { productId })
      .groupBy('r.rating')
      .getRawMany();

    const ratingStats: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;
    let totalCount  = 0;

    stats.forEach(({ rating: r, count }) => {
      ratingStats[r] = parseInt(count);
      totalRating   += r * parseInt(count);
      totalCount    += parseInt(count);
    });

    const avgRating = totalCount > 0
      ? Math.round((totalRating / totalCount) * 10) / 10
      : 0;

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      avgRating,
      ratingStats,
    };
  }

  // Get reviews of a user
  async findByUserId(userId: number): Promise<Review[]> {
    return this.find({
      where:     { userId },
      relations: ['product'],
      order:     { createdAt: 'DESC' },
    });
  }

  // Kiểm tra user đã mua sản phẩm chưa (qua bảng order_items)
  async hasUserPurchasedProduct(userId: number, productId: number): Promise<boolean> {
    const result = await this.dataSource.query(
      `SELECT COUNT(*) as count
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.user_id = ? AND oi.product_id = ? AND o.status = 'completed'`,
      [userId, productId],
    );
    return parseInt(result[0].count) > 0;
  }
}