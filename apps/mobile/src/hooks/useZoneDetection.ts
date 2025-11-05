import { useEffect, useRef, useState } from 'react';
import { captureRef } from 'react-native-view-shot';

export interface ZoneDetectionOptions {
  enabled: boolean;
  sessionId: string;
  intervalMs?: number; // Default: 3000ms (3 seconds)
  quality?: number; // JPEG quality 0-1, Default: 0.7
  apiUrl?: string; // Default: http://localhost:8080
}

export interface ZoneDetectionResult {
  zoneCode: string;
  zoneName: string;
  confidence: number;
  timestamp: string;
}

/**
 * Hook for automatic zone detection from video screenshots (React Native)
 * Only enable this on the HOST/TRAINER client to avoid duplicate detections
 */
export function useZoneDetection(
  viewRef: React.RefObject<any>,
  options: ZoneDetectionOptions,
) {
  const [lastDetectedZone, setLastDetectedZone] = useState<ZoneDetectionResult | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!options.enabled || !viewRef.current) {
      return;
    }

    const apiUrl = options.apiUrl || 'http://localhost:8080';
    const intervalMs = options.intervalMs || 3000;
    const quality = options.quality || 0.7;

    const captureAndDetect = async () => {
      if (!viewRef.current) {
        return;
      }

      try {
        setIsDetecting(true);
        setError(null);

        // Capture screenshot using react-native-view-shot
        const uri = await captureRef(viewRef, {
          format: 'jpg',
          quality,
          result: 'data-uri', // Returns base64 data URI
        });

        // Send to backend for ML analysis
        const response = await fetch(`${apiUrl}/zone-detector/detect`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: options.sessionId,
            imageBase64: uri, // Already in data:image/jpeg;base64,... format
          }),
        });

        if (!response.ok) {
          throw new Error(`Zone detection failed: ${response.statusText}`);
        }

        const result: ZoneDetectionResult = await response.json();
        setLastDetectedZone(result);

        console.log(
          `[ZoneDetection] Detected: ${result.zoneCode} (${result.zoneName}) - Confidence: ${(result.confidence * 100).toFixed(1)}%`,
        );
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('[ZoneDetection] Error:', errorMessage);
      } finally {
        setIsDetecting(false);
      }
    };

    // Start interval
    intervalRef.current = setInterval(captureAndDetect, intervalMs);

    // Initial capture after 1 second (let video load first)
    setTimeout(captureAndDetect, 1000);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [options.enabled, options.sessionId, viewRef]);

  return {
    lastDetectedZone,
    isDetecting,
    error,
  };
}
