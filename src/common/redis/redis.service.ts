import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService  } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly redis: Redis;

  constructor(private configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get('redis.host'),
      port: this.configService.get('redis.port'),
      password: this.configService.get('redis.password'),
      db: this.configService.get('redis.db'),
    });
  }

  async onModuleInit() {
    // Test connection
    try {
      await this.redis.ping();
      console.log('✅ Redis connected successfully');
    } catch (error) {
      console.error('❌ Redis connection failed:', error);
    }
  }

  async get(key: string) {
    return this.redis.get(key);
  }
  
  async del(key: string) {
    return this.redis.del(key);
  }

  async set(key: string, value: string, ttl: number) {
    return this.redis.set(key, value, 'EX', ttl);
  }
}