import { cn } from '@/lib/utils';
import type { RecommendationLevel } from '@/types';

interface RecommendationBadgeProps {
  level: RecommendationLevel;
  className?: string;
}

// Color + label per recommendation level (see implementation.md §3.3).
const LEVELS: Record<RecommendationLevel, { label: string; ring: string; dot: string }> = {
  buy: { label: 'Buy', ring: 'ring-success/40 bg-success/10 text-success', dot: 'bg-success' },
  hold: { label: 'Hold', ring: 'ring-accent/40 bg-accent/10 text-accent', dot: 'bg-accent' },
  avoid: {
    label: 'Avoid',
    ring: 'ring-destructive/40 bg-destructive/10 text-destructive',
    dot: 'bg-destructive',
  },
  watch: { label: 'Watch', ring: 'ring-primary/40 bg-primary/10 text-primary', dot: 'bg-primary' },
};

/**
 * Pulsing, color-coded badge communicating the headline recommendation. The pulse
 * ring draws the eye to the single most important signal on the card.
 */
export function RecommendationBadge({ level, className }: RecommendationBadgeProps) {
  const style = LEVELS[level] ?? LEVELS.watch;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ring-2',
        style.ring,
        className
      )}
    >
      <span className={cn('h-2 w-2 rounded-full', style.dot)}>
        <span className={cn('block h-2 w-2 animate-ping rounded-full', style.dot)} />
      </span>
      {style.label}
    </span>
  );
}
