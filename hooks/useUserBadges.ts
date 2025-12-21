import { useEffect, useState } from 'react';
import { listenToUserBadges } from '../services/dataService';
import { Badge } from '../types';

export function useUserBadges(wallet: string | undefined | null) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!wallet) {
      setBadges([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const unsubscribe = listenToUserBadges(wallet, (data) => {
      setBadges(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [wallet]);

  return { badges, loading };
}