import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { AddToCartDto, UpdateCartDto } from './dtos/cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiAddToCart,
  ApiClearCart,
  ApiGetCart,
  ApiRemoveCartItem,
  ApiUpdateCartQuantity,
} from './swagger/carts.swagger';

@Controller('carts')
@UseGuards(JwtAuthGuard)   // tất cả route cart cần đăng nhập
export class CartsController {
  constructor(private readonly cartService: CartsService) {}

  // GET /cart
  @Get()
  @ApiGetCart()
  getCart(@Req() req: any) {
    return this.cartService.getCart(req.user.id);
  }

  // POST /cart
  @Post()
  @ApiAddToCart()
  addToCart(@Req() req: any, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(req.user.id, dto);
  }

  // PATCH /cart/:id
  @Patch(':id')
  @ApiUpdateCartQuantity()
  updateQuantity(
    @Param('id', ParseIntPipe) cartId: number,
    @Req() req: any,
    @Body() dto: UpdateCartDto,
  ) {
    return this.cartService.updateQuantity(cartId, req.user.id, dto);
  }

  // DELETE /cart/:id
  @Delete(':id')
  @ApiRemoveCartItem()
  removeItem(
    @Param('id', ParseIntPipe) cartId: number,
    @Req() req: any,
  ) {
    return this.cartService.removeItem(cartId, req.user.id);
  }

  // DELETE /cart
  @Delete()
  @ApiClearCart()
  clearCart(@Req() req: any) {
    return this.cartService.clearCart(req.user.id);
  }
}