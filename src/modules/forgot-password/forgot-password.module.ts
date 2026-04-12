import { Module } from '@nestjs/common';
import { ForgotPasswordService } from './forgot-password.service';
import { ForgotPasswordController } from './forgot-password.controller';

@Module({
  providers: [ForgotPasswordService],
  controllers: [ForgotPasswordController]
})
export class ForgotPasswordModule {}
