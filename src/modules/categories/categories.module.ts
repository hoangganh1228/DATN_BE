import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { UploadModule } from 'src/common/upload/upload.module';
import { Category } from './entities/category.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryRepository } from './repositories/category.repository';

@Module({
  imports: [UploadModule, TypeOrmModule.forFeature([Category])],
  providers: [CategoriesService, CategoryRepository],
  controllers: [CategoriesController],
  exports: [CategoriesService]
})
export class CategoriesModule {}
