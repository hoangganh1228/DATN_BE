import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { AppException } from 'src/common/exceptions/app.exception';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockUser = {
  id: 1,
  email: 'test@example.com',
  password: 'hashed_password',
  fullName: 'Test User',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUsersService = {
  create: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn(),
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    const config: Record<string, unknown> = {
      'jwt.expiresIn': 3600,
      'jwt.refreshExpiresIn': 604800,
    };
    return config[key];
  }),
};

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── register ───────────────────────────────────────────────────────────────

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
    };

    it('should create and return a new user', async () => {
      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(mockUsersService.create).toHaveBeenCalledTimes(1);
      expect(mockUsersService.create).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockUser);
    });

    it('should propagate exception when UsersService.create throws', async () => {
      const error = new AppException('EMAIL_ALREADY_EXISTS', HttpStatus.CONFLICT);
      mockUsersService.create.mockRejectedValue(error);

      await expect(service.register(registerDto)).rejects.toThrow(error);
    });
  });

  // ─── login ──────────────────────────────────────────────────────────────────

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return accessToken and refreshToken on valid credentials', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
      mockJwtService.signAsync
        .mockResolvedValueOnce('access_token_mock')
        .mockResolvedValueOnce('refresh_token_mock');

      const result = await service.login(loginDto);

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        accessToken: 'access_token_mock',
        refreshToken: 'refresh_token_mock',
      });
    });

    it('should throw UNAUTHORIZED when user is not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        new AppException('INVALID_CREDENTIALS', HttpStatus.UNAUTHORIZED),
      );
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UNAUTHORIZED when user has no password (OAuth user)', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        ...mockUser,
        password: null,
      });

      await expect(service.login(loginDto)).rejects.toThrow(
        new AppException('INVALID_CREDENTIALS', HttpStatus.UNAUTHORIZED),
      );
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UNAUTHORIZED when password does not match', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      await expect(service.login(loginDto)).rejects.toThrow(
        new AppException('INVALID_CREDENTIALS', HttpStatus.UNAUTHORIZED),
      );
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should sign access token with correct payload and expiry', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
      mockJwtService.signAsync.mockResolvedValue('token');

      await service.login(loginDto);

      expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(
        1,
        { sub: mockUser.id, email: mockUser.email },
        { expiresIn: 3600 },
      );
      expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(
        2,
        { sub: mockUser.id, email: mockUser.email },
        { expiresIn: 604800 },
      );
    });
  });

  // ─── getProfile ─────────────────────────────────────────────────────────────

  describe('getProfile', () => {
    it('should return user profile without password field', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await service.getProfile(mockUser.id);

      expect(mockUsersService.findById).toHaveBeenCalledWith(mockUser.id);
      expect(result).not.toHaveProperty('password');
      expect(result).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        fullName: mockUser.fullName,
      });
    });

    it('should throw NOT_FOUND when user does not exist', async () => {
      mockUsersService.findById.mockResolvedValue(null);

      await expect(service.getProfile(999)).rejects.toThrow(
        new AppException('USER_NOT_FOUND', HttpStatus.NOT_FOUND),
      );
    });
  });
});