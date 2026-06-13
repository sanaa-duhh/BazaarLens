import { AlertTriangle, TrendingDown, TrendingUp, Star, Package } from 'lucide-react';
import type { EventType } from '@/types';

const EVENT_CONFIG: Record<
  EventType,
  { icon: typeof AlertTriangle; label: string; textColor: string; bgFrom: string; bgTo: string; glowColor: string }
> = {
  price_drop: {
    icon: TrendingDown,
    label: 'Competitor Price Drop',
    textColor: 'text-red-400',
    bgFrom: 'from-red-950/80',
    bgTo: 'to-background',
    glowColor: 'rgba(239,68,68,0.4)',
  },
  demand_spike: {
    icon: TrendingUp,
    label: 'Demand Spike',
    textColor: 'text-green-400',
    bgFrom: 'from-green-950/80',
    bgTo: 'to-background',
    glowColor: 'rgba(34,197,94,0.4)',
  },
  sentiment_crash: {
    icon: Star,
    label: 'Sentiment Crash',
    textColor: 'text-amber-400',
    bgFrom: 'from-amber-950/80',
    bgTo: 'to-background',
    glowColor: 'rgba(245,158,11,0.4)',
  },
  stock_outage: {
    icon: Package,
    label: 'Competitor Stock Outage',
    textColor: 'text-blue-400',
    bgFrom: 'from-blue-950/80',
    bgTo: 'to-background',
    glowColor: 'rgba(37,99,235,0.4)',
  },
};

interface EventBannerProps {
  eventType: EventType;
  productName: string;
  triggeredAt: string;
}

export function EventBanner({ eventType, productName, triggeredAt }: EventBannerProps) {
  const config = EVENT_CONFIG[eventType] ?? {
    icon: AlertTriangle,
    label: eventType,
    textColor: 'text-accent',
    bgFrom: 'from-zinc-900',
    bgTo: 'to-background',
    glowColor: 'rgba(245,158,11,0.4)',
  };
  const Icon = config.icon;
  const date = new Date(triggeredAt).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className={`bg-gradient-to-b ${config.bgFrom} ${config.bgTo} border-b border-border px-4 py-5`}>
      <div className="flex items-center gap-4">
        {/* Icon with glow halo */}
        <div
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-black/40 ring-1 ring-white/10"
          style={{ boxShadow: `0 0 20px 4px ${config.glowColor}` }}
        >
          <Icon className={`h-6 w-6 ${config.textColor}`} />
        </div>

        <div className="min-w-0 flex-1">
          <p className={`text-xs font-bold uppercase tracking-widest ${config.textColor}`}>
            {config.label}
          </p>
          <p className="mt-0.5 truncate text-lg font-bold text-foreground">{productName}</p>
          <p className="text-xs text-muted-foreground">{date}</p>
        </div>
      </div>

      {/* Divider with glow */}
      <div
        className="mt-4 h-px"
        style={{
          background: `linear-gradient(to right, transparent, ${config.glowColor}, transparent)`,
        }}
      />
    </div>
  );
}
