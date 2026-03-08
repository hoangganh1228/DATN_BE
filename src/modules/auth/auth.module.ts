import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret') || 'secret',
        signOptions: { expiresIn: configService.get<number>('jwt.expiresIn') || 7 * 24 * 60 * 60 },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [ UsersService, AuthService, JwtStrategy],
  controllers: [AuthController]
})
export class AuthModule {}
