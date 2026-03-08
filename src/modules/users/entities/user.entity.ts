import { Entity, Column } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';

export type UserRole = '000' | '111' | '999';

@Entity('users')
export class User extends BaseEntity {
  @Column({ name: 'full_name', length: 100 })
  fullName: string;

  @Column({ type: 'varchar', length: 150, unique: true, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  password: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'enum', enum: ['000', '111', '999'], default: '000' })
  role: UserRole;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}