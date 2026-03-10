import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Điện thoại' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  parentId?: number;
}
export class CreateCategoryFormDto extends CreateCategoryDto {
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  image?: any;
}