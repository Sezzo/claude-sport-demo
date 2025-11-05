import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { ParserController } from './parser.controller';
import { ZoneDetectorController } from './zone-detector.controller';
import { PlayerGateway } from './player.gateway';
import { PrismaService } from './prisma.service';
import { ZoneMLService } from './zone-ml.service';

@Module({
  imports: [],
  controllers: [SessionsController, ParserController, ZoneDetectorController],
  providers: [PlayerGateway, PrismaService, ZoneMLService]
})
export class AppModule {}
