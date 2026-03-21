import { Entity, Column, ManyToOne, JoinColumn, Check } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('reviews')
@Check(`"rating" BETWEEN 1 AND 5`)
export class Review extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'product_id' })
  productId: number;

  @Column({ type: 'int', comment: 'value from 1 to 5' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}