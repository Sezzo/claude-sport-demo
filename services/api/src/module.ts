import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { ParserController } from './parser.controller';
import { PlayerGateway } from './player.gateway';
import { PrismaService } from './prisma.service';

@Module({
  imports: [],
  controllers: [SessionsController, ParserController],
  providers: [PlayerGateway, PrismaService]
})
export class AppModule {}
