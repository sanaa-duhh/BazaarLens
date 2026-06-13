import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import type { WatchlistResponse, EventType, SimulateEventResponse } from '@/types';

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'price_drop', label: 'Competitor Price Drop' },
  { value: 'demand_spike', label: 'Demand Spike' },
  { value: 'sentiment_crash', label: 'Sentiment Crash' },
  { value: 'stock_outage', label: 'Stock Outage' },
];

function AdminForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  if (searchParams.get('key') !== 'demo2026') {
    return <main className="min-h-screen bg-background" />;
  }

  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [productId, setProductId] = useState('');
  const [eventType, setEventType] = useState<EventType>('price_drop');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<WatchlistResponse>('/api/watchlist')
      .then((res) => {
        const items = res.items.map((i) => ({ id: i.product_id, name: i.product.name }));
        setProducts(items);
        if (items.length > 0) setProductId(items[0].id);
      })
      .catch(() => setResult('Failed to load watchlist'));
  }, []);

  async function trigger() {
    if (!productId) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post<SimulateEventResponse>('/api/events/simulate', {
        product_id: productId,
        event_type: eventType,
      });
      setResult(`Event triggered!\nID: ${res.event_id}\nNotifications sent. Strategy generating…`);
      setTimeout(() => navigate(`/strategy/${res.event_id}`), 3000);
    } catch (e) {
      setResult(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background p-6">
      <h1 className="mb-6 text-xl font-bold text-foreground">Demo Admin Panel</h1>
      <div className="max-w-sm space-y-4">
        <div>
          <label className="mb-1 block text-sm text-muted-foreground">Product</label>
          <select
            className="w-full rounded-lg border border-border bg-card p-3 text-foreground"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          >
            {products.length === 0 && <option>No products in watchlist</option>}
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted-foreground">Event Type</label>
          <select
            className="w-full rounded-lg border border-border bg-card p-3 text-foreground"
            value={eventType}
            onChange={(e) => setEventType(e.target.value as EventType)}
          >
            {EVENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <Button className="h-12 w-full" disabled={loading || !productId} onClick={trigger}>
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Trigger Event'}
        </Button>
        {result && (
          <pre className="whitespace-pre-wrap rounded-lg bg-card p-3 text-sm text-foreground">
            {result}
          </pre>
        )}
      </div>
    </main>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-background" />}>
      <AdminForm />
    </Suspense>
  );
}
