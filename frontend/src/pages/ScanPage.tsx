import { useCallback, useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Loader2, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CameraPermissionDenied } from '@/components/scan/CameraPermissionDenied';
import { ImageUpload } from '@/components/scan/ImageUpload';
import { ScanResult } from '@/components/scan/ScanResult';
import { api } from '@/lib/api';
import type { Product } from '@/types';
import type { ScannerError } from '@/hooks/useScanner';

const BarcodeScanner = lazy(() =>
  import('@/components/scan/BarcodeScanner').then((m) => ({ default: m.BarcodeScanner }))
);

type ScanState = 'IDLE' | 'SCANNING' | 'IDENTIFYING' | 'IDENTIFIED' | 'UPLOAD_FALLBACK';

const CURRENT_PRODUCT_KEY = 'bazaarlens_current_product';

export default function ScanPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<ScanState>('IDLE');
  const [product, setProduct] = useState<Product | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleDetected = useCallback(async (barcode: string) => {
    setState('IDENTIFYING');
    try {
      const result = await api.post<Product>('/api/scan/barcode', { barcode });
      sessionStorage.setItem(CURRENT_PRODUCT_KEY, JSON.stringify(result));
      setProduct(result);
      setState('IDENTIFIED');
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      setNotice(
        message.includes('PRODUCT_NOT_FOUND')
          ? "We couldn't find that barcode. Try a photo instead."
          : 'Lookup failed. Try a photo instead.'
      );
      setState('UPLOAD_FALLBACK');
    }
  }, []);

  const handleScannerError = useCallback((error: ScannerError) => {
    setNotice(
      error === 'permission_denied'
        ? null
        : 'Scanning is not supported on this device. Upload a photo instead.'
    );
    setState('UPLOAD_FALLBACK');
  }, []);

  function reset() {
    setProduct(null);
    setNotice(null);
    setState('IDLE');
  }

  return (
    <main className="relative flex min-h-screen flex-col bg-background pb-16">
      {state === 'SCANNING' && (
        <Suspense fallback={null}>
          <BarcodeScanner onDetected={handleDetected} onError={handleScannerError} />
        </Suspense>
      )}

      {state === 'IDLE' && (
        <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-card">
            <ScanLine className="h-12 w-12 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Scan a product</h1>
            <p className="text-sm text-muted-foreground">
              Point your camera at any barcode to get instant market intelligence.
            </p>
          </div>
          <div className="w-full max-w-xs space-y-3">
            <Button className="h-12 w-full text-base" onClick={() => setState('SCANNING')}>
              <Camera className="h-5 w-5" />
              Start scanning
            </Button>
            <Button
              variant="ghost"
              className="h-12 w-full text-base"
              onClick={() => setState('UPLOAD_FALLBACK')}
            >
              Upload a photo instead
            </Button>
          </div>
        </div>
      )}

      {state === 'IDENTIFYING' && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Identifying product…</p>
        </div>
      )}

      {state === 'UPLOAD_FALLBACK' && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
          <CameraPermissionDenied />
          {notice && <p className="max-w-xs text-center text-xs text-accent">{notice}</p>}
          <div className="w-full max-w-xs space-y-3">
            <ImageUpload
              onIdentifying={() => setState('IDENTIFYING')}
              onIdentified={(p) => {
                sessionStorage.setItem(CURRENT_PRODUCT_KEY, JSON.stringify(p));
                setProduct(p);
                setState('IDENTIFIED');
              }}
              onError={(message) => {
                setNotice(message);
                setState('UPLOAD_FALLBACK');
              }}
            />
            <Button variant="ghost" className="h-12 w-full text-base" onClick={reset}>
              Back
            </Button>
          </div>
        </div>
      )}

      <ScanResult
        product={product}
        open={state === 'IDENTIFIED'}
        onOpenChange={(open) => {
          if (!open) reset();
        }}
        onViewIntelligence={(id) => navigate(`/product/${id}`)}
      />
    </main>
  );
}
