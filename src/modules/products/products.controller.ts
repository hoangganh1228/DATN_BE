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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { QueryProductDto } from './dtos/query-product.dto';
import { multerConfig } from 'src/common/upload/multer.config';
import {
  ApiFindAllProducts,
  ApiFindOneProduct,
  ApiFindProductBySlug,
  ApiCreateProduct,
  ApiUpdateProduct,
  ApiUpdateProductStatus,
  ApiUpdateProductStock,
  ApiRemoveProduct,
} from './swagger/products.swagger';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiFindAllProducts()
  findAll(@Query() query: QueryProductDto) {
    return this.productsService.findAll(query);
  }

  @Get('slug/:slug')
  @ApiFindProductBySlug()
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Get(':id')
  @ApiFindOneProduct()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Post()
  @ApiCreateProduct()
  @UseInterceptors(FileInterceptor('image', multerConfig))
  create(
    @Body() dto: CreateProductDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.productsService.create(dto, file);
  }

  @Patch(':id')
  @ApiUpdateProduct()
  @UseInterceptors(FileInterceptor('image', multerConfig))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.productsService.update(id, dto, file);
  }

  @Patch(':id/status')
  @ApiUpdateProductStatus()
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: 'active' | 'inactive' | 'out_of_stock',
  ) {
    return this.productsService.updateStatus(id, status);
  }

  @Patch(':id/stock')
  @ApiUpdateProductStock()
  updateStock(
    @Param('id', ParseIntPipe) id: number,
    @Body('quantity', ParseIntPipe) quantity: number,
  ) {
    return this.productsService.updateStock(id, quantity);
  }

  @Delete(':id')
  @ApiRemoveProduct()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}