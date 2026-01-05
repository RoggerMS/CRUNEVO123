import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    if (process.env.SKIP_DB_CONNECT === 'true') {
        this.logger.warn('Skipping Database Connection (SKIP_DB_CONNECT=true)');
        return;
    }
    try {
        await this.$connect();
        this.logger.log('Connected to Database');
    } catch (e) {
        this.logger.error('Failed to connect to Database', e);
        // Do not throw error here to allow app to start for diagnostics
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
