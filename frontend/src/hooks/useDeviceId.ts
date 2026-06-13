

import { useEffect, useState } from 'react';
import { getDeviceId } from '@/lib/utils';

/**
 * Persistent anonymous identity for the device. Returns `null` during SSR and the
 * first client render (before hydration) so consumers can guard fetches and avoid
 * hydration mismatches; resolves to the localStorage UUID after mount.
 */
export function useDeviceId(): string | null {
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    setDeviceId(getDeviceId());
  }, []);

  return deviceId;
}
