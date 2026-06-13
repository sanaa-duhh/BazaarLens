import { CameraOff } from 'lucide-react';

/**
 * Shown when the camera is denied or unavailable. Purely presentational — the
 * scan page pairs it with `<ImageUpload>` so the user can still identify a product.
 */
export function CameraPermissionDenied() {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <CameraOff className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold text-foreground">Camera unavailable</h2>
      <p className="max-w-xs text-sm text-muted-foreground">
        We couldn&apos;t access your camera. Upload a photo of the product and our AI will
        identify it instead.
      </p>
    </div>
  );
}
