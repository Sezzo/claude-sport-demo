import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('sessions')
export class SessionsController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async create(@Body() dto: { youtubeVideoId: string; title?: string; hostUserId?: string; startAt?: string }) {
    return this.prisma.session.create({
      data: {
        youtubeVideoId: dto.youtubeVideoId,
        title: dto.title ?? null,
        hostUserId: dto.hostUserId ?? 'default-host'
      }
    });
  }

  @Post(':id/join')
  async join(@Param('id') id: string, @Body() body: { userId: string; role?: string }) {
    await this.prisma.sessionMember.create({
      data: { sessionId: id, userId: body.userId, role: body.role ?? 'participant' }
    });
    return { ok: true };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.prisma.session.findUnique({ where: { id }, include: { members: true } });
  }

  @Get(':id/cues')
  async cues(@Param('id') id: string) {
    const sess = await this.prisma.session.findUnique({ where: { id } });
    if (!sess) return [];
    return this.prisma.videoCue.findMany({ where: { youtubeVideoId: sess.youtubeVideoId }, orderBy: { startS: 'asc' } });
  }
}
