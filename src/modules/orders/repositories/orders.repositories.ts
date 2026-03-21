import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Order } from '../entities/orders.entity';
import { QueryOrderDto } from '../dtos/orders.dto';

export interface PaginatedOrders {
  data:       Order[];
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
}

@Injectable()
export class OrderRepository extends Repository<Order> {
  constructor(private readonly dataSource: DataSource) {
    super(Order, dataSource.createEntityManager());
  }

  async findById(id: number): Promise<Order | null> {
    return this.findOne({
      where:     { id },
      relations: ['items', 'items.product', 'user'],
    });
  }

  // Get orders of a specific user (customer view)
  async findByUserId(
    userId: number,
    query:  QueryOrderDto,
  ): Promise<PaginatedOrders> {
    const { status, paymentStatus, page = 1, limit = 10 } = query;

    const qb = this.createQueryBuilder('o')
      .leftJoinAndSelect('o.items', 'items')
      .where('o.userId = :userId', { userId });

    if (status)        qb.andWhere('o.status = :status',               { status });
    if (paymentStatus) qb.andWhere('o.paymentStatus = :paymentStatus', { paymentStatus });

    qb.orderBy('o.createdAt', 'DESC').skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // Get all orders (admin)
  async findAll(query: QueryOrderDto): Promise<PaginatedOrders> {
    const { status, paymentStatus, page = 1, limit = 10 } = query;

    const qb = this.createQueryBuilder('o')
      .leftJoinAndSelect('o.items', 'items')
      .leftJoinAndSelect('o.user',  'user');

    if (status)        qb.andWhere('o.status = :status',               { status });
    if (paymentStatus) qb.andWhere('o.paymentStatus = :paymentStatus', { paymentStatus });

    qb.orderBy('o.createdAt', 'DESC').skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // Get order by id and check if it belongs to the user
  async findByIdAndUserId(id: number, userId: number): Promise<Order | null> {
    return this.findOne({
      where:     { id, userId },
      relations: ['items', 'items.product'],
    });
  }
}