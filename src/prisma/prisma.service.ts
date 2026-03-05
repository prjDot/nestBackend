import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { resolveSupabaseDatabaseConfig } from './supabase-database-url';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleDestroy, OnModuleInit
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(configService: ConfigService) {
    const { databaseUrl } = resolveSupabaseDatabaseConfig(configService);
    const adapter = new PrismaPg({ connectionString: databaseUrl });

    super({
      adapter
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('Database connection established.');
    } catch (error) {
      const trace = error instanceof Error ? error.stack : undefined;
      this.logger.error('Database connection failed during bootstrap.', trace);
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRawUnsafe('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
