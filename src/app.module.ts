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
import { UsersModule } from './users/users.module';
import { WatchlistModule } from './watchlist/watchlist.module';
import { InstrumentsModule } from './instruments/instruments.module';
import { QuotesModule } from './quotes/quotes.module';
import { AnalyticsModule } from './analytics/analytics.module';

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
    InstrumentsModule,
    QuotesModule,
    AnalyticsModule
  ],
  controllers: [HealthController],
  providers: [AppLoggerService]
})
export class AppModule {}
