import { InsightPanel, type InsightPanelProps } from './InsightPanel';

/** Customer-sentiment panel. Interchangeable with the other insight panels. */
export function ReviewInsight(props: InsightPanelProps) {
  return <InsightPanel {...props} />;
}
