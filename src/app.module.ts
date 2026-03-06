import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AlertsModule } from './alerts/alerts.module';
import { AuthModule } from './auth/auth.module';
import { AppLoggerService } from './common/logger/app-logger.service';
import { DevicesModule } from './devices/devices.module';
import { HealthController } from './health/health.controller';
import { NotificationsModule } from './notifications/notifications.module';
import { PrismaModule } from './prisma/prisma.module';
import { SearchHistoryModule } from './search-history/search-history.module';
import { StatsModule } from './stats/stats.module';
import { StockAnalyzerModule } from './stock-analyzer/modules/stock-analyzer.module';
import { UsersModule } from './users/users.module';
import { WatchlistModule } from './watchlist/watchlist.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    DevicesModule,
    SearchHistoryModule,
    WatchlistModule,
    AlertsModule,
    NotificationsModule,
    StatsModule,
    StockAnalyzerModule
  ],
  controllers: [HealthController],
  providers: [AppLoggerService]
})
export class AppModule {}
