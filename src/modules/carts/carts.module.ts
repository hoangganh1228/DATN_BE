import { Module } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CartsController } from './carts.controller';
import { Cart } from './entities/cart.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartRepository } from './repositories/cart.repository';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart]),
    ProductsModule,
  ],
  providers: [CartsService, CartRepository],
  controllers: [CartsController],
  exports: [CartsService, CartRepository]
})
export class CartsModule {}
