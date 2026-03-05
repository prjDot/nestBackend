import { Injectable, NotFoundException } from '@nestjs/common';
import type { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { UpdateMeDto } from './dto/update-me.dto';

interface MyProfile {
  id: string;
  provider: 'google' | 'kakao';
  email: string | null;
  name: string;
  nickname: string | null;
  picture: string | null;
  locale: string | null;
  theme: string;
  notificationEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async getMe(userId: string): Promise<MyProfile> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException({
        code: 'RESOURCE_NOT_FOUND',
        message: '사용자를 찾을 수 없습니다',
        detail: null
      });
    }

    return toMyProfile(user);
  }

  async updateMe(userId: string, payload: UpdateMeDto): Promise<MyProfile> {
    const user = await this.prismaService.user.update({
      where: { id: userId },
      data: {
        name: payload.name,
        nickname: payload.nickname,
        picture: payload.picture,
        locale: payload.locale,
        theme: payload.theme,
        notificationEnabled: payload.notificationEnabled
      }
    });

    return toMyProfile(user);
  }
}

function toMyProfile(user: User): MyProfile {
  return {
    id: user.id,
    provider: user.provider === 'GOOGLE' ? 'google' : 'kakao',
    email: user.email,
    name: user.name,
    nickname: user.nickname,
    picture: user.picture,
    locale: user.locale,
    theme: user.theme,
    notificationEnabled: user.notificationEnabled,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    lastLoginAt: user.lastLoginAt.toISOString()
  };
}
