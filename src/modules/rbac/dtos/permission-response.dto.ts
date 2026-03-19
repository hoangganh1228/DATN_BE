import { ApiProperty } from '@nestjs/swagger';
import { PermissionAction } from '../entities/permission.entity';

export class PermissionResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ example: 'product.create' })
  name: string;

  @ApiProperty({ enum: ['create', 'read', 'update', 'delete'] as PermissionAction[] })
  action: PermissionAction;

  @ApiProperty({ required: false, nullable: true })
  description: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

