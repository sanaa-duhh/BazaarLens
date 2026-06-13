const ADVISORS = [
  { letter: 'M', label: 'Marketing', color: 'bg-primary' },
  { letter: 'P', label: 'Product', color: 'bg-success' },
  { letter: 'S', label: 'Sales', color: 'bg-accent' },
];

export function StrategyLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <div className="flex gap-4">
        {ADVISORS.map(({ letter, label, color }, i) => (
          <div key={letter} className="flex flex-col items-center gap-2">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-full ${color} animate-pulse text-xl font-bold text-white`}
              style={{ animationDelay: `${i * 150}ms` }}
            >
              {letter}
            </div>
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
      <div className="space-y-1">
        <p className="text-base font-semibold text-foreground">Your AI team is analyzing…</p>
        <p className="text-sm text-muted-foreground">Building your market strategy</p>
      </div>
    </div>
  );
}
