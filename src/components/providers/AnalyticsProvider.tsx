'use client';

import { useEffect } from 'react';

export function AnalyticsProvider() {
  useEffect(() => {
    const ping = async () => {
      try {
        await fetch('/api/analytics/ping', { method: 'POST' });
      } catch (error) {
        // Ignore errors
      }
    };

    // Initial ping
    ping();

    // Ping every 30 seconds
    const interval = setInterval(ping, 30000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
