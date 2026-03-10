import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { multerConfig } from 'src/common/upload/multer.config';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiCreateCategory, ApiFindAllCategories, ApiFindOneCategory, ApiRemoveCategory, ApiUpdateCategory } from './swagger/categories.swagger';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}
  
  @Get()
  @ApiFindAllCategories()
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @ApiFindOneCategory()
  async findOne(@Param('id') id: number) {
    return this.categoriesService.findOne(id);
  }

  @Post()
  @ApiCreateCategory()
  @UseInterceptors(FileInterceptor('image', multerConfig))
  create(
    @Body() dto: CreateCategoryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.categoriesService.create(dto, file);
  }

  @Patch(':id')
  @ApiUpdateCategory()
  @UseInterceptors(FileInterceptor('image', multerConfig))
  update(
    @Param('id') id: number,
    @Body() dto: CreateCategoryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.categoriesService.update(id, dto, file);
  }

  @Delete(':id')
  @ApiRemoveCategory()
  remove(@Param('id') id: number) {
    return this.categoriesService.remove(id);
  }
}

