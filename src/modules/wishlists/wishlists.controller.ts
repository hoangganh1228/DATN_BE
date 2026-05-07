import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto, QueryWishlistDto } from './dtos/wishlists.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiAddToWishlist,
  ApiCheckWishlist,
  ApiClearWishlist,
  ApiGetMyWishlist,
  ApiRemoveFromWishlist,
} from './swagger/wishlists.swagger';

@Controller('wishlists')
@UseGuards(JwtAuthGuard)
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  // GET /wishlists/me  — list paginated wishlist of the current user
  @Get('me')
  @ApiGetMyWishlist()
  getMyWishlist(@Req() req: any, @Query() query: QueryWishlistDto) {
    return this.wishlistsService.getMyWishlist(req.user.id, query);
  }

  // GET /wishlists/check/:productId  — check if product is in the user's wishlist
  @Get('check/:productId')
  @ApiCheckWishlist()
  checkInWishlist(
    @Req() req: any,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.wishlistsService.checkInWishlist(req.user.id, productId);
  }

  // POST /wishlists  — add a product to the wishlist
  @Post()
  @ApiAddToWishlist()
  addToWishlist(@Req() req: any, @Body() dto: CreateWishlistDto) {
    return this.wishlistsService.addToWishlist(req.user.id, dto);
  }

  // DELETE /wishlists/:productId  — remove a product from the wishlist
  @Delete(':productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiRemoveFromWishlist()
  removeFromWishlist(
    @Req() req: any,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.wishlistsService.removeFromWishlist(req.user.id, productId);
  }

  // DELETE /wishlists  — clear all items in the user's wishlist
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiClearWishlist()
  clearWishlist(@Req() req: any) {
    return this.wishlistsService.clearWishlist(req.user.id);
  }
}
