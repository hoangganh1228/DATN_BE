import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { UploadModule } from 'src/common/upload/upload.module';
import { Product } from './entities/product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductRepository } from './repositories/product.repository';

@Module({
  imports: [UploadModule, TypeOrmModule.forFeature([Product])],
  providers: [ProductsService, ProductRepository],
  controllers: [ProductsController],
  exports: [ProductsService, ProductRepository]
})
export class ProductsModule {}
