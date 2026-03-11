import { Injectable, HttpStatus } from '@nestjs/common';
import { ProductRepository } from './repositories/product.repository';
import { UploadService } from 'src/common/upload/upload.service';
import { AppException } from 'src/common/exceptions/app.exception';
import { generateSlug } from 'src/common/utils/slug.util';
import { QueryProductDto } from './dtos/query-product.dto';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productRepo: ProductRepository,
    private readonly uploadService: UploadService,
  ) {}

  async findAll(query: QueryProductDto) {
    return this.productRepo.findWithFilters(query);
  }

  async findOne(id: number) {
    const product = await this.productRepo.findById(id);
    if (!product) {
      throw new AppException('PRODUCT_NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    return product;
  }

  async findBySlug(slug: string) {
    const product = await this.productRepo.findBySlug(slug);
    if (!product) {
      throw new AppException('PRODUCT_NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    return product;
  }

  async create(dto: CreateProductDto, file?: Express.Multer.File) {
    const baseSlug = generateSlug(dto.name);
    const slug     = await this.productRepo.generateUniqueSlug(baseSlug);

    const imageUrl = file
      ? await this.uploadService.uploadFile(file, 'products')
      : null;

    const product = this.productRepo.create({
      ...dto,
      slug,
      imageUrl,
      status: dto.status ?? 'active',
    });

    return this.productRepo.save(product);
  }

  async update(id: number, dto: UpdateProductDto, file?: Express.Multer.File) {
    const product = await this.findOne(id);

    let slug = product.slug;
    if (dto.name && dto.name !== product.name) {
      const baseSlug = generateSlug(dto.name);
      slug = await this.productRepo.generateUniqueSlug(baseSlug, id);
    }

    let imageUrl = product.imageUrl;
    if (file) {
      imageUrl = await this.uploadService.replaceFile(
        product.imageUrl,
        file,
        'products',
      );
    }

    return this.productRepo.save(
      Object.assign(product, { ...dto, slug, imageUrl }),
    );
  }

  async remove(id: number) {
    const product = await this.findOne(id);

    if (product.imageUrl) {
      await this.uploadService.deleteFile(product.imageUrl).catch(() => {});
    }

    await this.productRepo.remove(product);
  }

  async updateStatus(id: number, status: 'active' | 'inactive' | 'out_of_stock') {
    const product = await this.findOne(id);
    product.status = status;
    return this.productRepo.save(product);
  }

  async updateStock(id: number, quantity: number) {
    const product = await this.findOne(id);

    product.stockQuantity += quantity;

    if (product.stockQuantity < 0) {
      throw new AppException('INSUFFICIENT_STOCK', HttpStatus.BAD_REQUEST);
    }
    if (product.stockQuantity === 0) {
      product.status = 'out_of_stock';
    }

    return this.productRepo.save(product);
  }
}