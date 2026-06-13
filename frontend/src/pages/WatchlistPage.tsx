import { Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { WatchlistCard } from '@/components/watchlist/WatchlistCard';
import { EmptyWatchlist } from '@/components/watchlist/EmptyWatchlist';
import { EnableAlertsCard } from '@/components/watchlist/EnableAlertsCard';
import { useWatchlist } from '@/hooks/useWatchlist';

export default function WatchlistPage() {
  const { items, isLoading, remove } = useWatchlist();

  return (
    <main className="flex min-h-screen flex-col bg-background pb-20">
      <header className="sticky top-0 z-10 border-b border-border bg-background px-4 py-4">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">Watchlist</h1>
          {!isLoading && items.length > 0 && (
            <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {items.length}
            </span>
          )}
        </div>
      </header>

      {isLoading ? (
        <div className="space-y-3 p-4">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <>
          <EnableAlertsCard />
          <EmptyWatchlist />
        </>
      ) : (
        <>
          <EnableAlertsCard />
          <ul className="space-y-3 p-4">
            {items.map((item) => (
              <li key={item.id}>
                <WatchlistCard item={item} onRemove={remove} />
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
