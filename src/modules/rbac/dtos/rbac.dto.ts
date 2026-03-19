import {
  IsString,
  IsOptional,
  IsArray,
  IsInt,
  IsEnum,
  MaxLength,
  ArrayUnique,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PermissionAction } from '../entities/permission.entity';

export class CreateRoleDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({ example: 'Quyen quan tri' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @ApiPropertyOptional({ type: [Number], example: [1, 2], required: false })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Type(() => Number)
  permissionIds?: number[];
}

export class UpdateRoleDto {
  @ApiPropertyOptional({ example: 'admin' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ example: 'Quyen quan tri' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @ApiPropertyOptional({ type: [Number], example: [1, 2], required: false })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Type(() => Number)
  permissionIds?: number[];
}

export class AssignRoleDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Type(() => Number)
  userId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Type(() => Number)
  roleId: number;
}

export class CreatePermissionDto {
  @ApiProperty({ example: 'product.create' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ enum: ['create', 'read', 'update', 'delete'] as PermissionAction[] })
  @IsEnum(['create', 'read', 'update', 'delete'] as PermissionAction[])
  action: PermissionAction;

  @ApiPropertyOptional({ example: 'Tao san pham moi' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;
}

export class UpdatePermissionDto {
  @ApiPropertyOptional({ example: 'product.create' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ enum: ['create', 'read', 'update', 'delete'] as PermissionAction[] })
  @IsOptional()
  @IsEnum(['create', 'read', 'update', 'delete'] as PermissionAction[])
  action?: PermissionAction;

  @ApiPropertyOptional({ example: 'Tao san pham moi' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;
}