import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { resolveSupabaseDatabaseConfig } from './supabase-database-url';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleDestroy
{
  constructor(configService: ConfigService) {
    const { databaseUrl } = resolveSupabaseDatabaseConfig(configService);
    const adapter = new PrismaPg({ connectionString: databaseUrl });

    super({
      adapter
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
