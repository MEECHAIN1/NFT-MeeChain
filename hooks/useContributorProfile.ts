import { useEffect, useState } from 'react';
import { listenToContributorProfile } from '../services/dataService';
import { ContributorProfile } from '../types';

export function useContributorProfile(wallet: string | undefined | null) {
  const [profile, setProfile] = useState<ContributorProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!wallet) {
      setProfile(null);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const unsubscribe = listenToContributorProfile(wallet, (data) => {
      if (data) {
        setProfile(data);
      } else {
        // If no profile, create a default one to show Level 1
        setProfile({
            xp: 0,
            level: 1,
            levelXp: 0,
            nextLevelXp: 250, // XP_PER_LEVEL
            progress: 0,
        });
      }
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [wallet]);

  return { profile, loading };
}