import { Skeleton } from '@/components/ui/skeleton';

/** Loading state for the intelligence card — four panel placeholders + a thinking line. */
export function IntelligenceCardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
          <Skeleton className="mb-3 h-4 w-32" />
          <Skeleton className="mb-2 h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      ))}
      <p className="flex items-center justify-center gap-1 pt-2 text-sm text-muted-foreground">
        AI is thinking
        <span className="inline-flex">
          <span className="animate-fade-in-1">.</span>
          <span className="animate-fade-in-2">.</span>
          <span className="animate-fade-in-3">.</span>
        </span>
      </p>
    </div>
  );
}
