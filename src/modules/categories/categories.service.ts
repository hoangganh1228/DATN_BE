import { HttpStatus, Injectable } from '@nestjs/common';
import { UploadService } from 'src/common/upload/upload.service';
import { CategoryRepository } from './repositories/category.repository';
import { AppException } from 'src/common/exceptions/app.exception';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { generateSlug } from 'src/common/utils/slug.util';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly categoryRepo: CategoryRepository,
    private readonly uploadService: UploadService,  
  ){}

  async findAll() {
    return this.categoryRepo.find();
  }

  async findOne(id: number) {
    const category = await this.categoryRepo.findById(id);
    if (!category) {
      throw new AppException('CATEGORY_NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    return category;
  }

  async create(
    dto:  CreateCategoryDto,
    file: Express.Multer.File | undefined,
  ) {
    const baseSlug  = generateSlug(dto.name);
    const slug = await this.categoryRepo.generateUniqueSlug(baseSlug);

    const imageUrl = file
      ? await this.uploadService.uploadFile(file, 'categories')
      : null;

    return this.categoryRepo.save(
      this.categoryRepo.create({ ...dto, imageUrl, slug }),
    );
  }

  async update(
    id:   number,
    dto:  CreateCategoryDto,
    file: Express.Multer.File | undefined,
  ) {
    const category = await this.findOne(id);

    let imageUrl = category.imageUrl;
    if (file) {
      imageUrl = await this.uploadService.replaceFile(
        category.imageUrl,
        file,
        'categories',
      );
    }

    return this.categoryRepo.save(
      Object.assign(category, { ...dto, imageUrl }),
    );
  } 

  async remove(id: number) {
    const category = await this.findOne(id);

    if (category.imageUrl) {
      await this.uploadService.deleteFile(category.imageUrl).catch(() => {});
    }

    await this.categoryRepo.remove(category);
  }
}
