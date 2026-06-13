

import { useEffect } from 'react';
import { useScanner, type ScannerError } from '@/hooks/useScanner';

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
  onError?: (error: ScannerError) => void;
}

/**
 * Full-screen camera scanner with an animated corner overlay. Starts on mount and
 * tears down the camera on unmount. Must be loaded via `next/dynamic` with
 * `ssr: false` — the underlying ZXing reader cannot run on the server.
 */
export function BarcodeScanner({ onDetected, onError }: BarcodeScannerProps) {
  const { videoRef, isScanning, error, startScanning, stopScanning } = useScanner({
    onDetected,
  });

  useEffect(() => {
    startScanning();
    return () => stopScanning();
  }, [startScanning, stopScanning]);

  useEffect(() => {
    if (error) onError?.(error);
  }, [error, onError]);

  return (
    <div className="fixed inset-0 z-40 bg-black">
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        playsInline
        muted
        autoPlay
      />

      {/* Dark vignette outside the scan frame */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 h-64 w-64">
          {/* Transparent cutout inside the corners */}
          <div className="absolute inset-0 rounded-lg bg-transparent ring-[999px] ring-black/50" />

          {/* Corner brackets */}
          <span className="absolute left-0 top-0 h-10 w-10 rounded-tl-lg border-l-4 border-t-4 border-primary drop-shadow-[0_0_6px_rgba(37,99,235,0.8)]" />
          <span className="absolute right-0 top-0 h-10 w-10 rounded-tr-lg border-r-4 border-t-4 border-primary drop-shadow-[0_0_6px_rgba(37,99,235,0.8)]" />
          <span className="absolute bottom-0 left-0 h-10 w-10 rounded-bl-lg border-b-4 border-l-4 border-primary drop-shadow-[0_0_6px_rgba(37,99,235,0.8)]" />
          <span className="absolute bottom-0 right-0 h-10 w-10 rounded-br-lg border-b-4 border-r-4 border-primary drop-shadow-[0_0_6px_rgba(37,99,235,0.8)]" />

          {/* Animated laser sweep line */}
          {isScanning && (
            <span className="animate-scan-sweep absolute inset-x-2 h-0.5 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-90 shadow-[0_0_8px_2px_rgba(37,99,235,0.6)]" />
          )}
        </div>
      </div>

      {isScanning && (
        <p className="absolute inset-x-0 bottom-28 text-center text-sm font-medium text-white/80">
          Hold steady…
        </p>
      )}
    </div>
  );
}
