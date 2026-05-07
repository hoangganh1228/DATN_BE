import { Entity, Column, ManyToOne, JoinColumn, Unique, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('wishlists')
@Unique('uq_wishlist_user_product', ['userId', 'productId'])
@Index('idx_wishlist_user', ['userId'])
export class Wishlist extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'product_id' })
  productId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
