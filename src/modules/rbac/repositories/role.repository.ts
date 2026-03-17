import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Role } from '../entities/role.entity';

@Injectable()
export class RoleRepository extends Repository<Role> {
  constructor(private readonly dataSource: DataSource) {
    super(Role, dataSource.createEntityManager());
  }

  async findById(id: number): Promise<Role | null> {
    return this.findOne({
      where: { id },
      relations: ['permissions'],
    });
  }

  async findByName(name: string): Promise<Role | null> {
    return this.findOne({ where: { name } });
  }

  async findAllWithPermissions(): Promise<Role[]> {
    return this.find({ relations: ['permissions'] });
  }

  async existsByName(name: string, excludeId?: number): Promise<boolean> {
    const qb = this.createQueryBuilder('r').where('r.name = :name', { name });
    if (excludeId) qb.andWhere('r.id != :excludeId', { excludeId });
    return (await qb.getCount()) > 0;
  }
}