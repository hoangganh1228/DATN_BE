import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoleResponseDto } from './role-response.dto';

export class UserRoleResponseDto {
  @ApiProperty()
  userId: number;

  @ApiProperty()
  roleId: number;

  @ApiPropertyOptional({ type: RoleResponseDto, required: false })
  role?: RoleResponseDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

