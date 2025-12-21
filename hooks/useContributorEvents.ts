import { useEffect, useState } from 'react';
import { listenToContributorEvents } from '../services/dataService';
import { TimelineEvent } from '../types';

export function useContributorEvents(wallet: string | undefined | null) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!wallet) {
      setEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = listenToContributorEvents(wallet, (data) => {
      setEvents(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [wallet]);

  return { events, loading };
}