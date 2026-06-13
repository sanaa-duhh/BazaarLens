

import { useCallback, useRef, useState } from 'react';
import type { IScannerControls } from '@zxing/browser';

export type ScannerError = 'permission_denied' | 'not_supported' | null;

interface UseScannerOptions {
  // Called once with the decoded text on the first successful decode.
  onDetected: (barcode: string) => void;
}

/**
 * Wraps ZXing's `BrowserMultiFormatReader` behind a small, SSR-safe surface.
 * Consumers attach `videoRef` to a `<video>` element and call `startScanning()`.
 * The reader is dynamically imported so it never executes during SSR.
 */
export function useScanner({ onDetected }: UseScannerOptions) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<ScannerError>(null);

  const stopScanning = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setIsScanning(false);
  }, []);

  const startScanning = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      setError('not_supported');
      return;
    }
    const video = videoRef.current;
    if (!video) return;

    setError(null);
    try {
      const { BrowserMultiFormatReader } = await import('@zxing/browser');
      const reader = new BrowserMultiFormatReader();
      const controls = await reader.decodeFromConstraints(
        { video: { facingMode: 'environment' } },
        video,
        (result, _err, scanControls) => {
          if (!result) return;
          scanControls.stop();
          setIsScanning(false);
          onDetected(result.getText());
        }
      );
      controlsRef.current = controls;
      setIsScanning(true);
    } catch (err) {
      const denied =
        err instanceof DOMException &&
        (err.name === 'NotAllowedError' || err.name === 'NotFoundError');
      setError(denied ? 'permission_denied' : 'not_supported');
      setIsScanning(false);
    }
  }, [onDetected]);

  return { videoRef, isScanning, error, startScanning, stopScanning };
}
