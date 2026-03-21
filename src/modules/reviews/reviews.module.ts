import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Review } from './entitites/reviews.entity';
import { ProductsModule } from '../products/products.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { ReviewRepository } from './repositories/reviews.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review]),
    ProductsModule,
    UsersModule,
  ],
  providers: [ReviewsService, ReviewRepository],
  controllers: [ReviewsController],
  exports: [ReviewsService, ReviewRepository],
})
export class ReviewsModule {}
