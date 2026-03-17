import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserRole } from '../entities/user-role.entity';

@Injectable()
export class UserRoleRepository extends Repository<UserRole> {
  constructor(private readonly dataSource: DataSource) {
    super(UserRole, dataSource.createEntityManager());
  }

  async findByUserId(userId: number): Promise<UserRole[]> {
    return this.find({
      where: { userId },
      relations: ['role', 'role.permissions'],
    });
  }

  async findOne_(userId: number, roleId: number): Promise<UserRole | null> {
    return this.findOne({ where: { userId, roleId } });
  }

  async existsAssignment(userId: number, roleId: number): Promise<boolean> {
    return (await this.count({ where: { userId, roleId } })) > 0;
  }

  // Lấy tất cả permissions của user thông qua các roles
  async getUserPermissions(userId: number): Promise<string[]> {
    const userRoles = await this.findByUserId(userId);
    const permissions = userRoles
      .flatMap((ur) => ur.role?.permissions ?? [])
      .map((p) => p.name);
    return [...new Set(permissions)]; // loại bỏ trùng lặp
  }
}