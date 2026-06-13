import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';

export function EmptyWatchlist() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-card">
        <Eye className="h-10 w-10 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-lg font-semibold text-foreground">No products monitored yet</p>
        <p className="text-sm text-muted-foreground">
          Scan a product and add it to your watchlist to get market alerts.
        </p>
      </div>
      <Link
        to="/scan"
        className="flex h-12 w-full max-w-xs items-center justify-center rounded-md bg-primary text-base font-medium text-primary-foreground"
      >
        Scan your first product
      </Link>
    </div>
  );
}
