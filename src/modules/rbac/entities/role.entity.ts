import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';
import { Permission } from './permission.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('roles')
export class Role extends BaseEntity {
  @Column({ length: 50, unique: true, nullable: true })
  name: string;

  @Column({ length: 200, nullable: true })
  // Use `string` (nullable in DB) to avoid TypeORM inferring `Object`
  // when `strictNullChecks` is enabled.
  description?: string;

  @ManyToMany(() => Permission, (permission) => permission.roles, { eager: true })
  @JoinTable({
    name:              'role_permissions',
    joinColumn:        { name: 'role_id',       referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: Permission[];
}