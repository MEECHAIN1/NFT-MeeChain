import { useEffect, useState } from 'react';
import { listenToVoiceLogs } from '../services/dataService';
import { VoiceLog } from '../types';

export function useVoiceLogs(wallet: string | undefined | null) {
  const [voiceLogs, setVoiceLogs] = useState<VoiceLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!wallet) {
      setVoiceLogs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = listenToVoiceLogs(wallet, (data) => {
      setVoiceLogs(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [wallet]);

  return { voiceLogs, loading };
}