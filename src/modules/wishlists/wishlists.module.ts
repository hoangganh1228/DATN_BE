import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WishlistsController } from './wishlists.controller';
import { WishlistsService } from './wishlists.service';
import { Wishlist } from './entities/wishlist.entity';
import { WishlistRepository } from './repositories/wishlists.repository';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wishlist]),
    ProductsModule,
    UsersModule,
  ],
  providers: [WishlistsService, WishlistRepository],
  controllers: [WishlistsController],
  exports: [WishlistsService, WishlistRepository],
})
export class WishlistsModule {}
