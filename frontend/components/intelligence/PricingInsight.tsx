import { InsightPanel, type InsightPanelProps } from './InsightPanel';

/** Pricing-opportunity panel. Interchangeable with the other insight panels. */
export function PricingInsight(props: InsightPanelProps) {
  return <InsightPanel {...props} />;
}
