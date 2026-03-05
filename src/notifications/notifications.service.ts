import { Injectable, NotFoundException } from '@nestjs/common';
import type { NotificationLog } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

interface NotificationResponse {
  id: string;
  symbol: string | null;
  title: string;
  body: string;
  deepLink: string | null;
  status: 'sent' | 'delivered' | 'opened' | 'failed';
  readAt: string | null;
  createdAt: string;
}

@Injectable()
export class NotificationsService {
  constructor(private readonly prismaService: PrismaService) {}

  async list(userId: string, unreadOnly: string | undefined): Promise<NotificationResponse[]> {
    const whereReadAt = unreadOnly === 'true' ? null : undefined;

    const notifications = await this.prismaService.notificationLog.findMany({
      where: {
        userId,
        readAt: whereReadAt
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return notifications.map(toNotificationResponse);
  }

  async markAsRead(userId: string, id: string): Promise<NotificationResponse> {
    const updated = await this.prismaService.notificationLog.updateMany({
      where: {
        id,
        userId
      },
      data: {
        readAt: new Date(),
        status: 'OPENED'
      }
    });

    if (updated.count === 0) {
      throw new NotFoundException({
        code: 'RESOURCE_NOT_FOUND',
        message: '알림을 찾을 수 없습니다',
        detail: null
      });
    }

    const notification = await this.prismaService.notificationLog.findUnique({
      where: { id }
    });

    if (!notification) {
      throw new NotFoundException({
        code: 'RESOURCE_NOT_FOUND',
        message: '알림을 찾을 수 없습니다',
        detail: null
      });
    }

    return toNotificationResponse(notification);
  }
}

function toNotificationResponse(notification: NotificationLog): NotificationResponse {
  return {
    id: notification.id,
    symbol: notification.symbol,
    title: notification.title,
    body: notification.body,
    deepLink: notification.deepLink,
    status: notification.status.toLowerCase() as NotificationResponse['status'],
    readAt: notification.readAt ? notification.readAt.toISOString() : null,
    createdAt: notification.createdAt.toISOString()
  };
}
