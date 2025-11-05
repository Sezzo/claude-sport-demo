import { Injectable, Logger } from '@nestjs/common';
import * as sharp from 'sharp';

export interface ZoneDetectionResult {
  code: string;
  name: string;
  confidence: number;
  dominantColor: { r: number; g: number; b: number };
}

/**
 * Service for detecting training zones from video screenshots
 * Uses color analysis to identify zone indicators in video frames
 */
@Injectable()
export class ZoneMLService {
  private readonly logger = new Logger(ZoneMLService.name);

  // Zone color definitions matching libs/shared-types
  private readonly zoneColors = [
    { code: 'white', name: 'Recovery', rgb: [255, 255, 255] },
    { code: 'grey', name: 'Endurance', rgb: [158, 158, 158] },
    { code: 'blue', name: 'Tempo', rgb: [33, 150, 243] },
    { code: 'green', name: 'Threshold', rgb: [76, 175, 80] },
    { code: 'yellow', name: 'VO2 Max', rgb: [255, 235, 59] },
    { code: 'red', name: 'Anaerobic', rgb: [244, 67, 54] },
  ];

  /**
   * Detect zone from image buffer
   * @param imageBuffer JPEG/PNG image buffer
   * @param options Optional configuration for detection
   */
  async detectZone(
    imageBuffer: Buffer,
    options?: {
      roiX?: number;
      roiY?: number;
      roiWidth?: number;
      roiHeight?: number;
    },
  ): Promise<ZoneDetectionResult> {
    try {
      let image = sharp(imageBuffer);

      // Extract Region of Interest (ROI) if specified
      // Default: analyze entire image
      if (options?.roiX !== undefined && options?.roiWidth) {
        image = image.extract({
          left: options.roiX,
          top: options.roiY || 0,
          width: options.roiWidth,
          height: options.roiHeight || 100,
        });
      }

      // Get raw pixel data
      const { data, info } = await image
        .resize(224, 224, { fit: 'cover' }) // Resize for performance
        .raw()
        .toBuffer({ resolveWithObject: true });

      // Calculate dominant color
      const dominantColor = this.calculateDominantColor(data, info.channels);

      // Map color to zone
      const zone = this.rgbToZone(
        dominantColor.r,
        dominantColor.g,
        dominantColor.b,
      );

      this.logger.log(
        `Detected zone: ${zone.code} (${zone.name}) with confidence ${zone.confidence.toFixed(2)} - RGB(${dominantColor.r}, ${dominantColor.g}, ${dominantColor.b})`,
      );

      return {
        ...zone,
        dominantColor,
      };
    } catch (error) {
      this.logger.error(`Zone detection failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calculate dominant color using average RGB method
   */
  private calculateDominantColor(
    data: Buffer,
    channels: number,
  ): { r: number; g: number; b: number } {
    let r = 0,
      g = 0,
      b = 0;
    const pixelCount = data.length / channels;

    for (let i = 0; i < data.length; i += channels) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      // Skip alpha channel if present
    }

    return {
      r: Math.round(r / pixelCount),
      g: Math.round(g / pixelCount),
      b: Math.round(b / pixelCount),
    };
  }

  /**
   * Map RGB color to training zone using Euclidean distance
   */
  private rgbToZone(
    r: number,
    g: number,
    b: number,
  ): { code: string; name: string; confidence: number } {
    let minDistance = Infinity;
    let bestZone = this.zoneColors[0];

    for (const zone of this.zoneColors) {
      // Calculate Euclidean distance in RGB color space
      const distance = Math.sqrt(
        Math.pow(r - zone.rgb[0], 2) +
          Math.pow(g - zone.rgb[1], 2) +
          Math.pow(b - zone.rgb[2], 2),
      );

      if (distance < minDistance) {
        minDistance = distance;
        bestZone = zone;
      }
    }

    // Calculate confidence (0-1 scale)
    // Max possible distance in RGB space: sqrt(255^2 * 3) ≈ 441
    const maxDistance = 441;
    const confidence = Math.max(0, 1 - minDistance / maxDistance);

    return {
      code: bestZone.code,
      name: bestZone.name,
      confidence,
    };
  }

  /**
   * Advanced: Calculate dominant color using histogram method
   * More accurate but slower than average method
   */
  private calculateDominantColorHistogram(
    data: Buffer,
    channels: number,
  ): { r: number; g: number; b: number } {
    // Create histograms for each channel
    const histR = new Array(256).fill(0);
    const histG = new Array(256).fill(0);
    const histB = new Array(256).fill(0);

    for (let i = 0; i < data.length; i += channels) {
      histR[data[i]]++;
      histG[data[i + 1]]++;
      histB[data[i + 2]]++;
    }

    // Find peaks in histograms
    const findPeak = (hist: number[]) => {
      let maxCount = 0;
      let peakValue = 0;
      for (let i = 0; i < hist.length; i++) {
        if (hist[i] > maxCount) {
          maxCount = hist[i];
          peakValue = i;
        }
      }
      return peakValue;
    };

    return {
      r: findPeak(histR),
      g: findPeak(histG),
      b: findPeak(histB),
    };
  }

  /**
   * Validate if detection confidence is high enough
   */
  isConfident(result: ZoneDetectionResult, threshold = 0.6): boolean {
    return result.confidence >= threshold;
  }
}
