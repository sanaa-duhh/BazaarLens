'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Eye, PackageSearch, Sparkles } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Product } from '@/types';

interface ScanResultProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CURRENT_PRODUCT_KEY = 'bazaarlens_current_product';

/**
 * Bottom sheet shown after a product is identified. Hands the product to the
 * intelligence page via sessionStorage so it does not need to be re-fetched.
 */
export function ScanResult({ product, open, onOpenChange }: ScanResultProps) {
  const router = useRouter();

  // Success haptic when the sheet opens (no-op on iOS, which lacks the Vibration API).
  useEffect(() => {
    if (open && product) navigator.vibrate?.([100, 50, 100]);
  }, [open, product]);

  if (!product) return null;

  const isVision = product.source === 'vision_llm';
  const lowConfidence = typeof product.confidence === 'number' && product.confidence < 0.7;

  function seeIntelligence() {
    if (!product) return;
    sessionStorage.setItem(CURRENT_PRODUCT_KEY, JSON.stringify(product));
    router.push(`/product/${product.id}`);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="gap-0 rounded-t-2xl bg-card pb-8">
        <SheetHeader className="px-5 pt-5">
          <SheetTitle className="sr-only">Identified product</SheetTitle>
        </SheetHeader>

        <div className="flex items-center gap-4 px-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">
            {product.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element -- remote product images come from many hosts
              <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <PackageSearch className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            {isVision && (
              <Badge className="mb-1 gap-1">
                <Sparkles className="h-3 w-3" />
                AI identified
              </Badge>
            )}
            <h2 className="truncate text-lg font-semibold text-foreground">{product.name}</h2>
            {product.brand && <p className="truncate text-sm text-muted-foreground">{product.brand}</p>}
            {product.category && (
              <p className="truncate text-xs text-muted-foreground">{product.category}</p>
            )}
          </div>
        </div>

        {lowConfidence && (
          <div className="mx-5 mt-4 flex items-start gap-2 rounded-lg bg-accent/10 p-3 text-xs text-accent">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Low confidence match — double-check this is the right product.</span>
          </div>
        )}

        <div className="mt-6 px-5">
          <Button className="h-12 w-full text-base" onClick={seeIntelligence}>
            <Eye className="h-5 w-5" />
            See Intelligence
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
