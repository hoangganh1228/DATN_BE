import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto, QueryReviewDto } from './dtos/reviews.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from '../rbac/guards/roles.guard';
import {
  ApiAdminDeleteReview,
  ApiCreateReview,
  ApiDeleteReview,
  ApiGetMyReviews,
  ApiGetProductReviews,
  ApiGetReviewById,
  ApiUpdateReview,
} from './swagger/reviews.swagger';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // GET /reviews/product/:productId  — public, anyone can view
  @Get('product/:productId')
  @ApiGetProductReviews()
  getProductReviews(
    @Param('productId', ParseIntPipe) productId: number,
    @Query() query: QueryReviewDto,
  ) {
    return this.reviewsService.getProductReviews(productId, query);
  }

  // GET /reviews/me  — user view reviews of themselves
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiGetMyReviews()
  getMyReviews(@Req() req: any) {
    return this.reviewsService.getMyReviews(req.user.id);
  }

  // GET /reviews/:id
  @Get(':id')
  @ApiGetReviewById()
  getReviewById(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.getReviewById(id);
  }

  // POST /reviews  — đăng nhập mới được review
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiCreateReview()
  createReview(@Req() req: any, @Body() dto: CreateReviewDto) {
    return this.reviewsService.createReview(req.user.id, dto);
  }

  // PATCH /reviews/:id  — chỉ chủ review mới sửa được
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiUpdateReview()
  updateReview(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewsService.updateReview(id, req.user.id, dto);
  }

  // DELETE /reviews/:id  — chủ review xóa của mình
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiDeleteReview()
  deleteReview(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.reviewsService.deleteReview(id, req.user.id, false);
  }

  // DELETE /reviews/:id/admin  — admin xóa bất kỳ review nào
  @Delete(':id/admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiAdminDeleteReview()
  adminDeleteReview(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.reviewsService.deleteReview(id, req.user.id, true);
  }
}