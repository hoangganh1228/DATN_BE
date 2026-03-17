import { Entity, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Role } from './role.entity';

// Junction table user_roles — composite PK nên không extends AbstractEntity
@Entity('user_roles')
export class UserRole {
  @Column({ name: 'user_id', primary: true })
  userId: number;

  @Column({ name: 'role_id', primary: true })
  roleId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}