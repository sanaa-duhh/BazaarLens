'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IntelligenceCard } from '@/components/intelligence/IntelligenceCard';
import { IntelligenceCardSkeleton } from '@/components/intelligence/IntelligenceCardSkeleton';
import { AddToWatchlistButton } from '@/components/watchlist/AddToWatchlistButton';
import { ShareButton } from '@/components/ShareButton';
import { api } from '@/lib/api';
import type { IntelligenceCard as IntelligenceCardData, Product } from '@/types';

const CURRENT_PRODUCT_KEY = 'bazaarlens_current_product';

type LoadState = 'loading' | 'ready' | 'error';

/**
 * Product intelligence page. The product is handed over from the scan flow via
 * sessionStorage (no second fetch); the intelligence card is generated on mount and
 * cached server-side, so revisiting the same product is instant.
 */
export default function ProductPage() {
  const router = useRouter();
  const productId = String(useParams().id ?? '');

  const [product, setProduct] = useState<Product | null>(null);
  const [card, setCard] = useState<IntelligenceCardData | null>(null);
  const [state, setState] = useState<LoadState>('loading');

  const generate = useCallback(async () => {
    if (!productId) return;
    setState('loading');
    try {
      const result = await api.post<IntelligenceCardData>('/api/intelligence', {
        product_id: productId,
      });
      setCard(result);
      setState('ready');
    } catch {
      setState('error');
    }
  }, [productId]);

  useEffect(() => {
    const stored = sessionStorage.getItem(CURRENT_PRODUCT_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Product;
        if (parsed.id === productId) setProduct(parsed);
      } catch {
        // Corrupt entry — proceed without the cached product details.
      }
    }
    void generate();
  }, [productId, generate]);

  // No GET-product endpoint exists yet, so fall back to a neutral title on cold loads.
  const productName = product?.name ?? 'Scanned product';

  return (
    <main className="relative mx-auto min-h-screen max-w-2xl bg-background px-4 pb-24 pt-4">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 -ml-1 text-muted-foreground"
        onClick={() => router.push('/scan')}
      >
        <ArrowLeft className="h-4 w-4" />
        Scan another
      </Button>

      {state === 'loading' && <IntelligenceCardSkeleton />}

      {state === 'ready' && card && <IntelligenceCard card={card} productName={productName} />}

      {state === 'error' && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t generate intelligence for this product.
          </p>
          <Button variant="outline" onClick={generate}>
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        </div>
      )}

      {state === 'ready' && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur">
          <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
            <AddToWatchlistButton productId={productId} className="h-12 flex-1 text-base" />
            <ShareButton title={`${productName} — BazaarLens intelligence`} />
          </div>
        </div>
      )}
    </main>
  );
}
