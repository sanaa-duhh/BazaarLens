import { cn } from '@/lib/utils';
import type { AIOpinion, Urgency } from '@/types';

const URGENCY_STYLES: Record<Urgency, { border: string; badge: string }> = {
  high: { border: 'border-destructive/50', badge: 'bg-destructive/10 text-destructive' },
  medium: { border: 'border-accent/50', badge: 'bg-accent/10 text-accent' },
  low: { border: 'border-success/50', badge: 'bg-success/10 text-success' },
};

interface AIOpinionCardProps {
  role: string;
  emoji: string;
  opinion: AIOpinion;
  className?: string;
}

export function AIOpinionCard({ role, emoji, opinion, className }: AIOpinionCardProps) {
  const urgency = (opinion.urgency as Urgency) in URGENCY_STYLES
    ? (opinion.urgency as Urgency)
    : 'medium';
  const styles = URGENCY_STYLES[urgency];

  return (
    <div className={cn('rounded-xl border bg-card p-4', styles.border, className)}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base leading-none">{emoji}</span>
          <span className="text-sm font-bold text-foreground">{role}</span>
        </div>
        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide', styles.badge)}>
          {urgency}
        </span>
      </div>
      <p className="mb-3 text-sm leading-relaxed text-muted-foreground">{opinion.opinion}</p>
      <div className="rounded-lg bg-muted/20 p-3 ring-1 ring-white/5">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Recommended Action</p>
        <p className="mt-1.5 text-sm font-semibold text-foreground">{opinion.action}</p>
      </div>
    </div>
  );
}
