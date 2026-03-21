import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrderItem } from './entities/orders-item.entity';
import { Order } from './entities/orders.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartsModule } from '../carts/carts.module';
import { OrderRepository } from './repositories/orders.repositories';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    CartsModule,
    ProductsModule,
  ],
  providers: [OrdersService, OrderRepository],
  controllers: [OrdersController],
  exports: [OrdersService, OrderRepository],
})
export class OrdersModule {}
