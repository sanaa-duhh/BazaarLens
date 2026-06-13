

import useSWR from 'swr';
import { api } from '@/lib/api';
import { useDeviceId } from './useDeviceId';
import type { WatchlistItem, WatchlistResponse } from '@/types';

const WATCHLIST_KEY = '/api/watchlist';

async function fetchWatchlist(): Promise<WatchlistItem[]> {
  const res = await api.get<WatchlistResponse>(WATCHLIST_KEY);
  return res.items;
}

export function useWatchlist() {
  const deviceId = useDeviceId();

  // Null key skips the fetch until deviceId is available — prevents SSR/hydration mismatch.
  const { data, isLoading, mutate } = useSWR<WatchlistItem[]>(
    deviceId ? WATCHLIST_KEY : null,
    fetchWatchlist,
    { revalidateOnFocus: false }
  );

  const items = data ?? [];

  async function add(productId: string): Promise<void> {
    await api.post(WATCHLIST_KEY, { product_id: productId });
    await mutate();
  }

  async function remove(productId: string): Promise<void> {
    await api.delete(`${WATCHLIST_KEY}/${productId}`);
    // Optimistic removal — update local cache before server confirms.
    await mutate(items.filter((i) => i.product_id !== productId), { revalidate: false });
  }

  function isWatching(productId: string): boolean {
    return items.some((i) => i.product_id === productId);
  }

  return { items, isLoading, add, remove, isWatching };
}
