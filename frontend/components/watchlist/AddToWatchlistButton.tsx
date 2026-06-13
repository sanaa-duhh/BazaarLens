'use client';

import { useState } from 'react';
import { Check, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface AddToWatchlistButtonProps {
  productId: string;
  className?: string;
}

interface WatchlistAddResponse {
  already_watching: boolean;
}

type Status = 'idle' | 'saving' | 'watching' | 'error';

/**
 * Adds a product to the device watchlist via POST /api/watchlist (idempotent on the
 * backend) and flips to a "Watching" confirmation. The watchlist route ships in
 * Phase 4 — until then this surfaces a retryable error rather than crashing.
 */
export function AddToWatchlistButton({ productId, className }: AddToWatchlistButtonProps) {
  const [status, setStatus] = useState<Status>('idle');

  async function add() {
    setStatus('saving');
    try {
      await api.post<WatchlistAddResponse>('/api/watchlist', { product_id: productId });
      navigator.vibrate?.([100, 50, 100]);
      setStatus('watching');
    } catch {
      setStatus('error');
    }
  }

  const watching = status === 'watching';
  return (
    <Button
      className={className}
      variant={watching ? 'secondary' : 'default'}
      disabled={status === 'saving' || watching}
      onClick={add}
    >
      {status === 'saving' && <Loader2 className="h-5 w-5 animate-spin" />}
      {watching ? <Check className="h-5 w-5" /> : status !== 'saving' && <Eye className="h-5 w-5" />}
      {watching ? 'Watching' : status === 'error' ? 'Retry' : 'Add to Watchlist'}
    </Button>
  );
}
