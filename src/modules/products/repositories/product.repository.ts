import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { QueryProductDto } from '../dtos/query-product.dto';

export interface PaginatedResult<T> {
  data:  T[];
  total: number;
  page:  number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ProductRepository extends Repository<Product> {
  constructor(private readonly dataSource: DataSource) {
    super(Product, dataSource.createEntityManager());
  }

  async findById(id: number): Promise<Product | null> {
    return this.findOne({
      where: { id },
      relations: ['category'],
    });
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return this.findOne({
      where: { slug },
      relations: ['category'],
    });
  }

  async findWithFilters(query: QueryProductDto): Promise<PaginatedResult<Product>> {
    const {
      search,
      categoryId,
      status,
      minPrice,
      maxPrice,
      page      = 1,
      limit     = 10,
      sortBy    = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const qb = this.createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'category');

    if (search) {
      qb.andWhere('p.name LIKE :search', { search: `%${search}%` });
    }
    if (categoryId) {
      qb.andWhere('p.categoryId = :categoryId', { categoryId });
    }
    if (status) {
      qb.andWhere('p.status = :status', { status });
    }
    if (minPrice !== undefined) {
      qb.andWhere('p.price >= :minPrice', { minPrice });
    }
    if (maxPrice !== undefined) {
      qb.andWhere('p.price <= :maxPrice', { maxPrice });
    }

    const allowedSort = ['price', 'name', 'createdAt', 'stockQuantity'];
    const orderField  = allowedSort.includes(sortBy) ? sortBy : 'createdAt';
    qb.orderBy(`p.${orderField}`, sortOrder);

    const skip  = (page - 1) * limit;
    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async generateUniqueSlug(baseSlug: string, excludeId?: number): Promise<string> {
    let slug   = baseSlug;
    let suffix = 1;

    while (true) {
      const qb = this.createQueryBuilder('p')
        .where('p.slug = :slug', { slug });

      if (excludeId) {
        qb.andWhere('p.id != :excludeId', { excludeId });
      }

      const exists = await qb.getOne();
      if (!exists) break;

      slug = `${baseSlug}-${suffix}`;
      suffix++;
    }

    return slug;
  }
}