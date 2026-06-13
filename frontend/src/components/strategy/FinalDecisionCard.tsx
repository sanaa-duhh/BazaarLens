import { AlertTriangle, Clock, Zap } from 'lucide-react';
import type { FinalDecision } from '@/types';

interface FinalDecisionCardProps {
  decision: FinalDecision;
}

export function FinalDecisionCard({ decision }: FinalDecisionCardProps) {
  return (
    <div className="animate-glow-pulse relative overflow-hidden rounded-2xl border-2 border-primary bg-gradient-to-b from-primary/10 to-primary/5 p-5">
      {/* Subtle radial background highlight */}
      <div className="pointer-events-none absolute -top-8 left-1/2 h-32 w-64 -translate-x-1/2 rounded-full bg-primary/15 blur-2xl" />

      <div className="relative">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            Final Decision
          </span>
        </div>

        {/* The headline action — largest text on the page */}
        <p className="mb-5 text-xl font-bold leading-snug text-foreground">
          {decision.recommended_action}
        </p>

        <div className="space-y-4 text-sm">
          <div className="rounded-xl bg-black/30 p-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Why this move
            </p>
            <p className="text-foreground">{decision.reasoning}</p>
          </div>

          <div className="rounded-xl bg-destructive/10 p-3 ring-1 ring-destructive/20">
            <div className="mb-1 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
              <p className="text-xs font-semibold uppercase tracking-wide text-destructive">
                Risk if you wait
              </p>
            </div>
            <p className="text-foreground/90">{decision.risk_assessment}</p>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-accent/10 px-4 py-3 ring-1 ring-accent/20">
            <Clock className="h-4 w-4 shrink-0 text-accent" />
            <p className="font-semibold text-accent">{decision.time_sensitivity}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
