import { Controller, Post, Body, Logger, BadRequestException } from '@nestjs/common';
import { ZoneMLService, ZoneDetectionResult } from './zone-ml.service';
import { PlayerGateway } from './player.gateway';

export class DetectZoneDto {
  sessionId: string;
  imageBase64: string;
  roiX?: number;
  roiY?: number;
  roiWidth?: number;
  roiHeight?: number;
}

/**
 * Controller for real-time zone detection from video screenshots
 */
@Controller('zone-detector')
export class ZoneDetectorController {
  private readonly logger = new Logger(ZoneDetectorController.name);

  constructor(
    private readonly mlService: ZoneMLService,
    private readonly gateway: PlayerGateway,
  ) {}

  /**
   * Detect training zone from screenshot
   * POST /zone-detector/detect
   */
  @Post('detect')
  async detectZone(@Body() dto: DetectZoneDto): Promise<ZoneDetectionResult> {
    try {
      this.logger.log(`Zone detection requested for session ${dto.sessionId}`);

      // Validate input
      if (!dto.imageBase64 || !dto.sessionId) {
        throw new BadRequestException('sessionId and imageBase64 are required');
      }

      // Decode base64 image
      // Handle both data URLs (data:image/jpeg;base64,xxx) and raw base64
      const base64Data = dto.imageBase64.includes(',')
        ? dto.imageBase64.split(',')[1]
        : dto.imageBase64;

      const imageBuffer = Buffer.from(base64Data, 'base64');

      if (imageBuffer.length === 0) {
        throw new BadRequestException('Invalid image data');
      }

      this.logger.debug(
        `Processing image: ${(imageBuffer.length / 1024).toFixed(2)} KB`,
      );

      // Run ML detection
      const result = await this.mlService.detectZone(imageBuffer, {
        roiX: dto.roiX,
        roiY: dto.roiY,
        roiWidth: dto.roiWidth,
        roiHeight: dto.roiHeight,
      });

      // Check confidence threshold
      const isConfident = this.mlService.isConfident(result, 0.5);
      if (!isConfident) {
        this.logger.warn(
          `Low confidence detection: ${result.confidence.toFixed(2)} for zone ${result.code}`,
        );
      }

      // Broadcast detected zone to all session participants via WebSocket
      this.gateway.broadcastZoneUpdate(dto.sessionId, {
        zoneCode: result.code,
        zoneName: result.name,
        confidence: result.confidence,
        timestamp: new Date().toISOString(),
      });

      return result;
    } catch (error) {
      this.logger.error(`Zone detection failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Health check endpoint
   * GET /zone-detector/health
   */
  @Post('health')
  health() {
    return {
      status: 'ok',
      service: 'zone-detector',
      timestamp: new Date().toISOString(),
    };
  }
}
