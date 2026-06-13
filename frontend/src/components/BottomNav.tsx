import { Link, useLocation } from 'react-router-dom';
import { Camera, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/scan', label: 'Scan', icon: Camera },
  { href: '/watchlist', label: 'Watchlist', icon: Eye },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md">
      <ul className="flex">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <li key={href} className="flex-1">
              <Link
                to={href}
                className={cn(
                  'relative flex min-h-[56px] flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {active && (
                  <span className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-primary shadow-[0_0_6px_rgba(37,99,235,0.8)]" />
                )}
                <span className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-xl transition-all',
                  active && 'bg-primary/10 shadow-[0_0_12px_rgba(37,99,235,0.25)]'
                )}>
                  <Icon className={cn('h-5 w-5', active && 'drop-shadow-[0_0_4px_rgba(37,99,235,0.7)]')} />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
