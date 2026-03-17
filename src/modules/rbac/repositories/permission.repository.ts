import { Injectable } from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';

@Injectable()
export class PermissionRepository extends Repository<Permission> {
  constructor(private readonly dataSource: DataSource) {
    super(Permission, dataSource.createEntityManager());
  }

  async findById(id: number): Promise<Permission | null> {
    return this.findOne({ where: { id } });
  }

  async findByIds(ids: number[]): Promise<Permission[]> {
    return this.findBy({ id: In(ids) });
  }

  async existsByName(name: string, excludeId?: number): Promise<boolean> {
    const qb = this.createQueryBuilder('p').where('p.name = :name', { name });
    if (excludeId) qb.andWhere('p.id != :excludeId', { excludeId });
    return (await qb.getCount()) > 0;
  }
}