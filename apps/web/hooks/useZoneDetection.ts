import { useEffect, useRef, useState } from 'react';

export interface ZoneDetectionOptions {
  enabled: boolean;
  sessionId: string;
  intervalMs?: number; // Default: 3000ms (3 seconds)
  quality?: number; // JPEG quality 0-1, Default: 0.7
  apiUrl?: string; // Default: http://localhost:8080
  roiX?: number; // Region of Interest X position
  roiY?: number; // Region of Interest Y position
  roiWidth?: number; // Region of Interest width
  roiHeight?: number; // Region of Interest height
}

export interface ZoneDetectionResult {
  zoneCode: string;
  zoneName: string;
  confidence: number;
  timestamp: string;
}

/**
 * Hook for automatic zone detection from video screenshots
 * Only enable this on the HOST/TRAINER client to avoid duplicate detections
 */
export function useZoneDetection(
  videoRef: React.RefObject<HTMLVideoElement>,
  options: ZoneDetectionOptions,
) {
  const [lastDetectedZone, setLastDetectedZone] = useState<ZoneDetectionResult | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!options.enabled || !videoRef.current) {
      return;
    }

    const apiUrl = options.apiUrl || 'http://localhost:8080';
    const intervalMs = options.intervalMs || 3000;
    const quality = options.quality || 0.7;

    const captureAndDetect = async () => {
      const video = videoRef.current;
      if (!video || video.paused || video.ended) {
        return;
      }

      try {
        setIsDetecting(true);
        setError(null);

        // Create canvas for screenshot
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Failed to get canvas context');
        }

        // Draw video frame to canvas
        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        } catch (drawError) {
          // CORS error - video from different origin
          throw new Error('Cannot capture video frame (CORS). Use Screen Capture API as fallback.');
        }

        // Convert to JPEG base64
        const imageBase64 = canvas.toDataURL('image/jpeg', quality);

        // Send to backend for ML analysis
        const response = await fetch(`${apiUrl}/zone-detector/detect`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: options.sessionId,
            imageBase64,
            roiX: options.roiX,
            roiY: options.roiY,
            roiWidth: options.roiWidth,
            roiHeight: options.roiHeight,
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

    // Initial capture
    captureAndDetect();

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [options.enabled, options.sessionId, videoRef]);

  return {
    lastDetectedZone,
    isDetecting,
    error,
  };
}

/**
 * Alternative: Screen Capture API-based zone detection
 * Use this if canvas drawImage fails due to CORS
 */
export function useScreenCaptureZoneDetection(
  options: ZoneDetectionOptions,
) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [lastDetectedZone, setLastDetectedZone] = useState<ZoneDetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startCapture = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          // @ts-ignore - displaySurface is not in TypeScript types yet
          displaySurface: 'window',
        },
      });

      setStream(mediaStream);

      // Create hidden video element
      const video = document.createElement('video');
      video.srcObject = mediaStream;
      video.play();
      videoRef.current = video;

      console.log('[ScreenCapture] Started screen capture for zone detection');
    } catch (err) {
      setError('Screen capture permission denied');
      console.error('[ScreenCapture] Error:', err);
    }
  };

  const stopCapture = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    return () => {
      stopCapture();
    };
  }, []);

  return {
    stream,
    startCapture,
    stopCapture,
    lastDetectedZone,
    error,
  };
}
