import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RecommendationBadge } from '@/components/intelligence/RecommendationBadge';
import type { RecommendationLevel, WatchlistItem } from '@/types';

interface WatchlistCardProps {
  item: WatchlistItem;
  onRemove: (productId: string) => void;
}

export function WatchlistCard({ item, onRemove }: WatchlistCardProps) {
  const { product, recommendation_level } = item;
  const level = recommendation_level as RecommendationLevel | null;

  return (
    <div className="flex items-center gap-3 rounded-xl bg-card p-4">
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="h-full w-full object-contain" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xl">📦</div>
        )}
      </div>

      <Link to={`/product/${product.id}`} className="min-w-0 flex-1">
        <p className="truncate font-semibold text-foreground">{product.name}</p>
        {product.brand && <p className="truncate text-sm text-muted-foreground">{product.brand}</p>}
        {product.category && <p className="truncate text-xs text-muted-foreground">{product.category}</p>}
        {level && <RecommendationBadge level={level} className="mt-2" />}
      </Link>

      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 flex-shrink-0 text-muted-foreground hover:text-destructive"
        onClick={() => onRemove(item.product_id)}
        aria-label="Remove from watchlist"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
