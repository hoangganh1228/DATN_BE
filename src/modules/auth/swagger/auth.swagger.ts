import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';
import { TokenResponseDto, UserResponseDto } from '../dtos/auth-response.dto';

export function ApiRegister() {
  return applyDecorators(
    ApiOperation({ summary: 'Register with email & password' }),
    ApiBody({ type: RegisterDto }),
    ApiResponse({ status: 201, description: 'Created', type: UserResponseDto }),
    ApiResponse({
      status: 409,
      description: 'Email already exists',
      schema: { example: { errorCode: 'USER_002', message: '...' } },
    }),
  );
}

export function ApiLogin() {
  return applyDecorators(
    ApiOperation({ summary: 'Login with email & password' }),
    ApiBody({ type: LoginDto }),
    ApiResponse({ status: HttpStatus.OK, type: TokenResponseDto }),
    ApiResponse({
      status: 401,
      description: 'Invalid credentials',
      schema: { example: { errorCode: 'AUTH_001', message: '...' } },
    }),
  );
}

export function ApiMe() {
  return applyDecorators(
    ApiOperation({ summary: 'Get current user profile' }),
    ApiBearerAuth(),
    ApiResponse({ status: 200, type: UserResponseDto }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
}