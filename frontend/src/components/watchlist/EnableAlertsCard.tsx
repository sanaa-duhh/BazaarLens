

import { useState } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddToHomeScreenModal } from './AddToHomeScreenModal';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export function EnableAlertsCard() {
  const { state, subscribe } = usePushNotifications();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Hide once subscribed or not supported.
  if (state === 'not_supported' || state === 'subscribed') return null;

  async function handleEnable() {
    if (state === 'not_standalone_ios') {
      setShowModal(true);
      return;
    }
    setLoading(true);
    try {
      await subscribe();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mx-4 mb-4 flex items-center gap-4 rounded-xl border border-primary/30 bg-primary/10 p-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/20">
          {state === 'permission_denied' ? (
            <BellOff className="h-5 w-5 text-primary" />
          ) : (
            <Bell className="h-5 w-5 text-primary" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">Get instant market alerts</p>
          <p className="text-xs text-muted-foreground">
            {state === 'permission_denied'
              ? 'Enable notifications in Settings → BazaarLens.'
              : 'Be first to know when competitors drop prices or stock runs out.'}
          </p>
        </div>
        {state !== 'permission_denied' && (
          <Button
            size="sm"
            className="flex-shrink-0"
            disabled={loading}
            onClick={handleEnable}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enable'}
          </Button>
        )}
      </div>

      <AddToHomeScreenModal open={showModal} onOpenChange={setShowModal} />
    </>
  );
}
