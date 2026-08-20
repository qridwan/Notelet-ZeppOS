import { useEffect, useState } from 'react';

import { getDatabase } from '../database/database';

export function useDatabaseReady(): { ready: boolean; error: Error | null } {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    getDatabase()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { ready, error };
}
