import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './orders-item.entity';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipping'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

// Define the valid status transition flow
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending:   ['confirmed', 'cancelled'],
  confirmed: ['shipping', 'cancelled'],
  shipping:  ['completed'],
  completed: [],
  cancelled: [],
};

@Entity('orders')
export class Order extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 15, scale: 2 })
  totalAmount: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'pending',
    comment: 'pending | confirmed | shipping | completed | cancelled',
  })
  status: OrderStatus;

  @Column({ name: 'shipping_address', type: 'text' })
  shippingAddress: string;

  // Explicitly set `type` to avoid TypeORM inferring `Object` from `string | null`.
  @Column({ name: 'payment_method', type: 'varchar', length: 50, nullable: true })
  paymentMethod: string | null;

  @Column({
    name: 'payment_status',
    type: 'varchar',
    length: 20,
    default: 'unpaid',
    comment: 'unpaid | paid | refunded',
  })
  paymentStatus: PaymentStatus;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager:   true,
  })
  items: OrderItem[];
}