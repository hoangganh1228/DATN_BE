import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ example: 'Điện thoại' })
  name: string;

  @ApiProperty({ example: 'dien-thoai' })
  slug: string;

  @ApiProperty({ required: false, nullable: true, example: "Danh mục điện thoại" })
  description: string | null;

  @ApiProperty({ required: false, nullable: true, example: 'https://example.com/categories/1.jpg' })
  imageUrl: string | null;

  @ApiProperty({ required: false, nullable: true, example: null })
  parentId: number | null;

  @ApiProperty({ type: () => CategoryResponseDto, required: false, nullable: true })
  parent: CategoryResponseDto | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
