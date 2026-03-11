import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

export type ProductStatus = 'active' | 'inactive' | 'out_of_stock';

@Entity('products')
export class Product extends BaseEntity {
  @Column({ name: 'category_id', nullable: true })
  categoryId: number | null;

  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category: Category | null;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 220, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  price: number;

  @Column({
    name: 'sale_price',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
  })
  salePrice: number | null;

  @Column({ name: 'stock_quantity', type: 'int', default: 0 })
  stockQuantity: number;

  @Column({ type: 'varchar', name: 'image', length: 255, nullable: true })
  imageUrl: string | null;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'active',
    comment: 'active | inactive | out_of_stock',
  })
  status: ProductStatus;
}