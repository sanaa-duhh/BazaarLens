'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { isIOS, isStandalone } from '@/lib/utils';

export type PushState =
  | 'not_supported'
  | 'not_standalone_ios'
  | 'permission_denied'
  | 'subscribed'
  | 'unsubscribed';

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const pad = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + pad).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  return Uint8Array.from(Array.from(raw).map((c) => c.charCodeAt(0)));
}

export function usePushNotifications() {
  const [state, setState] = useState<PushState>('unsubscribed');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('not_supported');
      return;
    }
    if (isIOS() && !isStandalone()) {
      setState('not_standalone_ios');
      return;
    }
    if (Notification.permission === 'denied') {
      setState('permission_denied');
      return;
    }
    // Check if already subscribed.
    navigator.serviceWorker.ready.then((reg) =>
      reg.pushManager.getSubscription().then((sub) => {
        setState(sub ? 'subscribed' : 'unsubscribed');
      })
    );
  }, []);

  // Must be called directly inside an onClick handler — browsers block
  // Notification.requestPermission() outside a user gesture.
  async function subscribe(): Promise<void> {
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) throw new Error('VAPID public key not configured');

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      setState('permission_denied');
      return;
    }

    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey).buffer as ArrayBuffer,
    });

    const json = sub.toJSON();
    await api.post('/api/push/subscribe', {
      endpoint: json.endpoint,
      p256dh: json.keys?.p256dh,
      auth: json.keys?.auth,
    });

    setState('subscribed');
  }

  async function unsubscribe(): Promise<void> {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    await sub?.unsubscribe();
    await api.delete('/api/push/subscribe');
    setState('unsubscribed');
  }

  return { state, subscribe, unsubscribe };
}
