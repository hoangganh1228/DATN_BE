import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'secret',
  expiresIn: process.env.JWT_EXPIRES || '7d',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
}));