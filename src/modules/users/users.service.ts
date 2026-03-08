import { HttpStatus, Injectable } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { User } from './entities/user.entity';
import { AppException } from 'src/common/exceptions/app.exception';
import { CreateUserDto } from './dtos/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly userRepo: UserRepository) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findByEmail(email);
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepo.findById(id);
  } 

  async create(dto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const existing = await this.findByEmail(dto.email);
    
    if (existing) {
      throw new AppException('EMAIL_ALREADY_EXISTS', HttpStatus.CONFLICT);
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    
    const entity = this.userRepo.create({
      ...dto,
      password: hashed,
    });
    const saved = await this.userRepo.save(entity);

    const { password: _, ...rest } = saved;
    return rest as Omit<User, 'password'>;
  }
}
