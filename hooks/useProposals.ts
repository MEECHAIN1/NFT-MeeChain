import { useEffect, useState } from 'react';
import { listenToProposals } from '../services/dataService';
import { Proposal } from '../types';

export function useProposals() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = listenToProposals((data) => {
      setProposals(data);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  return { proposals, loading };
}