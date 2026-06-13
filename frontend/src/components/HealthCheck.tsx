

import { useEffect } from 'react';

// Pings the backend /health endpoint in dev to verify connectivity.
// Only runs in development — stripped from production builds.
export function HealthCheck() {
  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
    fetch(`${apiUrl}/health`)
      .then((r) => r.json())
      .then((data) => console.info('[BazaarLens] Backend health:', data))
      .catch(() => console.warn('[BazaarLens] Backend not reachable at', apiUrl));
  }, []);

  return null;
}
