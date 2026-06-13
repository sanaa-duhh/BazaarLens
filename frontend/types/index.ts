// ─── Product ──────────────────────────────────────────────────────────────────

export type ProductSource = 'open_food_facts' | 'upc_db' | 'vision_llm' | 'unknown';

export interface Product {
  id: string;
  barcode: string | null;
  name: string;
  brand: string | null;
  category: string | null;
  image_url: string | null;
  source: ProductSource;
  confidence?: number;
  created_at: string;
}

// ─── Intelligence Card ────────────────────────────────────────────────────────

export type RecommendationLevel = 'buy' | 'hold' | 'avoid' | 'watch';

export interface IntelligenceCard {
  id: string;
  product_id: string;
  pricing_insight: string;
  review_insight: string;
  market_insight: string;
  recommendation: string;
  recommendation_level: RecommendationLevel;
  confidence: number | null;
  model_used: string | null;
  cached: boolean;
  generated_at: string;
}

// ─── Watchlist ────────────────────────────────────────────────────────────────

export interface WatchlistItem {
  id: string;
  device_id: string;
  product_id: string;
  added_at: string;
  product: Product;
  recommendation_level: RecommendationLevel | null;
}

// ─── Push ─────────────────────────────────────────────────────────────────────

export interface PushSubscriptionPayload {
  device_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

// ─── Market Events ────────────────────────────────────────────────────────────

export type EventType = 'price_drop' | 'demand_spike' | 'sentiment_crash' | 'stock_outage';

export interface MarketEvent {
  id: string;
  product_id: string;
  event_type: EventType;
  event_data: Record<string, unknown>;
  triggered_at: string;
}

// ─── Strategy ─────────────────────────────────────────────────────────────────

export type Urgency = 'high' | 'medium' | 'low';

export interface AIOpinion {
  opinion: string;
  action: string;
  urgency: Urgency;
}

export interface FinalDecision {
  recommended_action: string;
  reasoning: string;
  risk_assessment: string;
  time_sensitivity: string;
}

export interface Strategy {
  id: string;
  event_id: string;
  marketing_ai: AIOpinion;
  product_ai: AIOpinion;
  sales_ai: AIOpinion;
  final_decision: FinalDecision;
  model_used: string | null;
  generated_at: string;
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface ScanBarcodeResponse {
  product: Product;
}

export interface ScanImageResponse {
  product: Product;
  confidence: number;
}

export interface IntelligenceResponse {
  card: IntelligenceCard;
}

export interface WatchlistResponse {
  items: WatchlistItem[];
}

export interface SimulateEventResponse {
  event_id: string;
  triggered_at: string;
}

export interface StrategyResponse {
  strategy: Strategy;
  event: MarketEvent;
}
