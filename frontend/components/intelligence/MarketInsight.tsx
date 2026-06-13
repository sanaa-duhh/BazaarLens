import { InsightPanel, type InsightPanelProps } from './InsightPanel';

/** Market-position panel. Interchangeable with the other insight panels. */
export function MarketInsight(props: InsightPanelProps) {
  return <InsightPanel {...props} />;
}
