import { useEffect, useState } from 'react';
import { listenToUserDesigns } from '../services/dataService';
import { Design } from '../types';

export function useUserDesigns(wallet: string | undefined | null) {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!wallet) {
      setDesigns([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = listenToUserDesigns(wallet, (data) => {
      setDesigns(data);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [wallet]);

  return { designs, loading };
}