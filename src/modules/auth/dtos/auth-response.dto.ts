import { ApiProperty } from '@nestjs/swagger';

export class TokenResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIs...' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIs...' })
  refreshToken: string;
}

export class UserResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ example: 'Nguyen Van A' })
  fullName: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string | null;

  @ApiProperty({ example: '000' })
  role: string;

  @ApiProperty()
  isActive: boolean;
}