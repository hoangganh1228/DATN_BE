import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoryRepository extends Repository<Category> {
  constructor(private readonly dataSource: DataSource) {
    super(Category, dataSource.createEntityManager());
  }

  async findById(id: number) {
    return this.findOne({
      where: { id }, 
      relations: ['parent'] 
    });
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return this.findOne({ where: { slug } });
  }

  async generateUniqueSlug(baseSlug: string, excludeId?: number): Promise<string> {
    let slug = baseSlug;
    let suffix = 1;

    while (true) {
      const qb = this.createQueryBuilder('c')
        .where('c.slug = :slug', { slug });

      if (excludeId) {
        qb.andWhere('c.id != :excludeId', { excludeId });
      }

      const exists = await qb.getOne();
      if (!exists) break;             

      slug = `${baseSlug}-${suffix}`;
      suffix++;
    }

    return slug;
  }
}