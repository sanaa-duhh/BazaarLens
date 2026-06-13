

import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { resizeImage } from '@/services/productLookup';
import type { Product } from '@/types';

interface ImageUploadProps {
  onIdentifying: () => void;
  onIdentified: (product: Product) => void;
  onError: (message: string) => void;
}

/**
 * File-picker fallback that resizes the chosen photo and posts it to the vision
 * scan endpoint. `capture="environment"` opens the rear camera directly on mobile.
 */
export function ImageUpload({ onIdentifying, onIdentified, onError }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    onIdentifying();
    try {
      const imageBase64 = await resizeImage(file, 800, 0.8);
      const product = await api.post<Product>('/api/scan/image', { image_base64: imageBase64 });
      onIdentified(product);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Could not identify the product');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />
      <Button
        className="h-12 w-full text-base"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-5 w-5" />
        {isUploading ? 'Identifying…' : 'Upload a photo'}
      </Button>
    </>
  );
}
