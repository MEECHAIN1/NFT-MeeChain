import { useEffect, useState } from 'react';
import { listenToUserNFTs } from '../services/dataService';
import { NFT } from '../types';

export function useUserNFTs(wallet: string | undefined | null) {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!wallet) {
      setNfts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = listenToUserNFTs(wallet, (data) => {
      setNfts(data);
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [wallet]);

  return { nfts, loading };
}