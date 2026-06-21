import { HttpStatus, Injectable } from '@nestjs/common';
import { WishlistRepository } from './repositories/wishlists.repository';
import { ProductRepository } from '../products/repositories/product.repository';
import { AppException } from 'src/common/exceptions/app.exception';
import { CreateWishlistDto, QueryWishlistDto } from './dtos/wishlists.dto';
import { Wishlist } from './entities/wishlist.entity';

@Injectable()
export class WishlistsService {
  constructor(
    private readonly wishlistRepo: WishlistRepository,
    private readonly productRepo:  ProductRepository,
  ) {}

  // Get paginated wishlist of the current user
  async getMyWishlist(userId: number, query: QueryWishlistDto) {
    return this.wishlistRepo.findByUserId(userId, query);
  }

  // Check if a product is in the user's wishlist
  async checkInWishlist(userId: number, productId: number): Promise<{ inWishlist: boolean }> {
    const item = await this.wishlistRepo.findByUserAndProduct(userId, productId);
    return { inWishlist: !!item };
  }

  // Add a product to wishlist
  async addToWishlist(userId: number, dto: CreateWishlistDto): Promise<Wishlist> {
    const product = await this.productRepo.findById(dto.productId);
    if (!product) {
      throw new AppException('PRODUCT_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const existing = await this.wishlistRepo.findByUserAndProduct(userId, dto.productId);
    if (existing) {
      throw new AppException('WISHLIST_ALREADY_EXISTS', HttpStatus.CONFLICT);
    }

    const item = this.wishlistRepo.create({
      userId,
      productId: dto.productId,
    });

    return this.wishlistRepo.save(item);
  }

  // Remove a product from wishlist
  async removeFromWishlist(userId: number, productId: number): Promise<void> {
    const item = await this.wishlistRepo.findByUserAndProduct(userId, productId);
    if (!item) {
      throw new AppException('WISHLIST_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    await this.wishlistRepo.remove(item);
  }

  // Clear all items in the user's wishlist
  async clearWishlist(userId: number): Promise<void> {
    await this.wishlistRepo.clearByUserId(userId);
  }
}
