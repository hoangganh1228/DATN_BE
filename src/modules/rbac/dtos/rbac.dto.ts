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
import { PermissionAction } from '../entities/permission.entity';

export class CreateRoleDto {
  @IsString()
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Type(() => Number)
  permissionIds?: number[];
}

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Type(() => Number)
  permissionIds?: number[];
}

export class AssignRoleDto {
  @IsInt()
  @Type(() => Number)
  userId: number;

  @IsInt()
  @Type(() => Number)
  roleId: number;
}

export class CreatePermissionDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsEnum(['create', 'read', 'update', 'delete'] as PermissionAction[])
  action: PermissionAction;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;
}

export class UpdatePermissionDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsEnum(['create', 'read', 'update', 'delete'] as PermissionAction[])
  action?: PermissionAction;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;
}