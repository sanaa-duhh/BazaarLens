import { IndianRupee, MessageSquareText, Target, TrendingUp } from 'lucide-react';
import { PricingInsight } from './PricingInsight';
import { ReviewInsight } from './ReviewInsight';
import { MarketInsight } from './MarketInsight';
import { RecommendationBadge } from './RecommendationBadge';
import type { IntelligenceCard as IntelligenceCardData } from '@/types';

interface IntelligenceCardProps {
  card: IntelligenceCardData;
  productName: string;
}

const ICON = 'h-4 w-4';

/**
 * Full intelligence card. Panels reveal with a ~150ms stagger (animate-fade-in-1..4
 * from globals.css) so the card feels like the AI is composing its analysis live.
 */
export function IntelligenceCard({ card, productName }: IntelligenceCardProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-xl font-bold leading-tight text-foreground">{productName}</h1>
        <RecommendationBadge level={card.recommendation_level} className="shrink-0" />
      </div>

      <div className="animate-fade-in-1">
        <PricingInsight
          icon={<IndianRupee className={ICON} />}
          title="Pricing"
          content={card.pricing_insight}
        />
      </div>
      <div className="animate-fade-in-2">
        <ReviewInsight
          icon={<MessageSquareText className={ICON} />}
          title="Customer Sentiment"
          content={card.review_insight}
        />
      </div>
      <div className="animate-fade-in-3">
        <MarketInsight
          icon={<TrendingUp className={ICON} />}
          title="Market Position"
          content={card.market_insight}
        />
      </div>

      <div className="animate-fade-in-4 relative overflow-hidden rounded-xl bg-primary/5 p-4 ring-2 ring-primary/40 shadow-[0_0_20px_rgba(37,99,235,0.15)]">
        <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-primary/10 blur-xl" />
        <div className="relative">
          <div className="mb-2 flex items-center gap-2">
            <Target className={`${ICON} text-primary`} />
            <h3 className="text-sm font-semibold text-primary">Recommended Action</h3>
          </div>
          <p className="text-sm font-medium leading-relaxed text-foreground">{card.recommendation}</p>
        </div>
      </div>
    </div>
  );
}
