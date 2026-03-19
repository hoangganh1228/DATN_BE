import { Entity, Column, ManyToMany } from 'typeorm';
import { Role } from './role.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

export type PermissionAction = 'create' | 'read' | 'update' | 'delete';

@Entity('permissions')
export class Permission extends BaseEntity {
  @Column({ length: 100, unique: true, nullable: true })
  name: string; // vd: 'product.create', 'order.read'

  @Column({ length: 50 })
  action: PermissionAction;

  @Column({ length: 200, nullable: true })
  // Use `string` (nullable in DB) to avoid TypeORM inferring `Object`
  // when `strictNullChecks` is enabled.
  description?: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}