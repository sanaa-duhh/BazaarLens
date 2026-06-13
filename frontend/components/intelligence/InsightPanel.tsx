import type { ReactNode } from 'react';

/**
 * Shared contract for every insight panel. Pricing/Review/Market panels all accept
 * this exact interface so the card can treat them interchangeably (SOLID — Liskov).
 */
export interface InsightPanelProps {
  icon: ReactNode;
  title: string;
  content: string;
}

/** Presentational panel — one icon, one title, one paragraph of insight. */
export function InsightPanel({ icon, title, content }: InsightPanelProps) {
  return (
    <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <div className="mb-2 flex items-center gap-2 text-primary">
        {icon}
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{content}</p>
    </div>
  );
}
