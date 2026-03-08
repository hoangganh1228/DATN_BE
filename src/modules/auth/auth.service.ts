import { HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { AppException } from 'src/common/exceptions/app.exception';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.userService.create(dto);

    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email)
    if (!user || !user.password) {
      throw new AppException('INVALID_CREDENTIALS', HttpStatus.UNAUTHORIZED);
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    
    if (!isPasswordValid) {
      throw new AppException('INVALID_CREDENTIALS', HttpStatus.UNAUTHORIZED);
    }

    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email },
      { expiresIn: this.configService.get<number>('jwt.expiresIn') },
    );

    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email },
      { expiresIn: this.configService.get<number>('jwt.refreshExpiresIn') },
    );

    return { accessToken, refreshToken };
  }

  async getProfile(userId: number) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new AppException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    const { password: _, ...safe } = user;
    return safe;
  }
}
