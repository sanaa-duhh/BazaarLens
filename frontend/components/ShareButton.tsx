'use client';

import { useState } from 'react';
import { Check, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShareButtonProps {
  title: string;
  text?: string;
  className?: string;
}

/**
 * Shares the current page via the Web Share API — on iQOO this opens the native
 * sheet (Office Kit / Origin Notes / WhatsApp). Falls back to copying the URL to the
 * clipboard where Web Share is unavailable (most desktop browsers).
 */
export function ShareButton({ title, text, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      // User-cancelled shares reject — that is not an error worth surfacing.
      await navigator.share({ title, text, url }).catch(() => undefined);
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button variant="outline" size="icon-lg" className={className} onClick={share} aria-label="Share">
      {copied ? <Check className="h-5 w-5" /> : <Share2 className="h-5 w-5" />}
    </Button>
  );
}
