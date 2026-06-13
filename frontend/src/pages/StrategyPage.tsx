import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShareButton } from '@/components/ShareButton';
import { EventBanner } from '@/components/strategy/EventBanner';
import { AIOpinionCard } from '@/components/strategy/AIOpinionCard';
import { FinalDecisionCard } from '@/components/strategy/FinalDecisionCard';
import { StrategyLoadingState } from '@/components/strategy/StrategyLoadingState';
import { api } from '@/lib/api';
import type { EventType, Strategy, MarketEvent } from '@/types';

interface StrategyApiResponse {
  id: string;
  event_id: string;
  marketing_ai: Strategy['marketing_ai'];
  product_ai: Strategy['product_ai'];
  sales_ai: Strategy['sales_ai'];
  final_decision: Strategy['final_decision'];
  cached: boolean;
  generated_at: string;
  event: {
    id: string;
    product_id: string;
    event_type: string;
    event_data: Record<string, unknown>;
    triggered_at: string;
  };
}

interface StrategyData {
  strategy: Strategy;
  event: MarketEvent;
}

const AI_PANELS = [
  { key: 'marketing_ai' as const, role: 'Marketing AI', emoji: '📣' },
  { key: 'product_ai' as const, role: 'Product AI', emoji: '📦' },
  { key: 'sales_ai' as const, role: 'Sales AI', emoji: '💰' },
];

export default function StrategyPage() {
  const { eventId = '' } = useParams<{ eventId: string }>();
  const [data, setData] = useState<StrategyData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    api
      .post<StrategyApiResponse>('/api/strategy', { event_id: eventId })
      .then((res) => {
        setData({
          strategy: {
            id: res.id,
            event_id: res.event_id,
            marketing_ai: res.marketing_ai,
            product_ai: res.product_ai,
            sales_ai: res.sales_ai,
            final_decision: res.final_decision,
            model_used: null,
            generated_at: res.generated_at,
          },
          event: {
            id: res.event.id,
            product_id: res.event.product_id,
            event_type: res.event.event_type as EventType,
            event_data: res.event.event_data,
            triggered_at: res.event.triggered_at,
          },
        });
        setTimeout(() => setRevealed(true), 100);
      })
      .catch((e: Error) => setError(e.message));
  }, [eventId]);

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 pb-20 text-center">
        <p className="text-sm text-destructive">{error}</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="flex min-h-screen flex-col bg-background pb-20">
        <StrategyLoadingState />
      </main>
    );
  }

  const { strategy, event } = data;
  const productName = (event.event_data as Record<string, unknown>)['product_name'] as string | undefined;

  return (
    <main className="flex min-h-screen flex-col bg-background pb-24">
      <EventBanner
        eventType={event.event_type as EventType}
        productName={productName ?? 'Your product'}
        triggeredAt={event.triggered_at}
      />

      <div className="space-y-4 p-4">
        {AI_PANELS.map(({ key, role, emoji }, i) => (
          <div
            key={key}
            className={`transition-all duration-300 ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: `${i * 150}ms` }}
          >
            <AIOpinionCard role={role} emoji={emoji} opinion={strategy[key]} />
          </div>
        ))}

        <div
          className={`transition-all duration-300 ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ transitionDelay: '450ms' }}
        >
          <FinalDecisionCard decision={strategy.final_decision} />
        </div>
      </div>

      <div className="fixed bottom-20 left-0 right-0 px-4">
        <ShareButton
          title="BazaarLens Strategy"
          text={`Action: ${strategy.final_decision.recommended_action}`}
          className="w-full"
        />
      </div>
    </main>
  );
}
