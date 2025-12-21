import React, { useState, useMemo } from 'react';
import { NFT } from '../types';
import Card from './shared/Card';
import LoadingSkeleton from './shared/LoadingSkeleton';
import { getAudioContext, playBase64Audio } from '../utils/audioUtils';
import CopyButton from './shared/CopyButton';

interface HallOfOriginsProps {
  items: NFT[];
  loading: boolean;
  onMint: () => void;
  isMinting: boolean;
  evolvingNftId: string | null;
  newlyMintedNftId: string | null;
  onShowHistory: (nft: NFT) => void;
}

const RarityPill: React.FC<{ rarity: NFT['rarity'] }> = ({ rarity }) => {
  const colorMap = {
    Common: 'bg-gray-200 text-gray-800',
    Rare: 'bg-blue-200 text-blue-800',
    Epic: 'bg-purple-200 text-purple-800',
    Legendary: 'bg-amber-200 text-amber-800',
  };
  return (
    <span className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full ${colorMap[rarity]}`}>
      {rarity}
    </span>
  );
};

const NFTCard: React.FC<{ item: NFT, onShowHistory: (nft: NFT) => void, isEvolving: boolean, isNewlyMinted: boolean, style?: React.CSSProperties }> = ({ item, onShowHistory, isEvolving, isNewlyMinted, style }) => {
    
    const [isAudioLoading, setIsAudioLoading] = useState(false);

    const handlePlayAudio = async () => {
        if (!item.firstWords) return;
        const ctx = getAudioContext();
        if (ctx) {
            setIsAudioLoading(true);
            await playBase64Audio(item.firstWords, ctx);
            setIsAudioLoading(false);
        }
    };
    
    const currentStage = item.evolutionStages && item.evolutionStages.length > 0 
        ? item.evolutionStages[item.evolutionStages.length - 1] 
        : null;

    return (
        <Card className={`flex flex-col ${isNewlyMinted ? 'animate-crystal-burst' : 'animate-fade-in-up'} ${isEvolving ? 'evolve' : ''}`} style={style}>
            <div className="relative">
                <img src={item.imageUrl} alt={item.name} className="w-full h-48 object-cover" />
                <RarityPill rarity={item.rarity} />
                {item.firstWords && (
                     <button 
                        onClick={handlePlayAudio}
                        disabled={isAudioLoading}
                        className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-sky-500/80 backdrop-blur-sm text-white flex items-center justify-center hover:bg-sky-600 transition-all duration-200 shadow-lg disabled:bg-slate-400/50"
                        aria-label="Play First Words"
                     >
                       {isAudioLoading ? (
                           <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                       ) : (
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                       )}
                    </button>
                )}
            </div>
            <div className="p-4 flex-grow flex flex-col">
                <h3 className="font-bold text-lg text-slate-900">{item.name}</h3>
                <p className="text-slate-600 text-sm mt-1 mb-4 flex-grow">{item.description}</p>
                
                {currentStage ? (
                    <div className="mt-auto p-3 bg-slate-50/80 rounded-lg border border-slate-200/60 space-y-2">
                         <div>
                            <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Current Stage</p>
                            <p className="text-sm font-bold text-slate-800">
                                Stage {currentStage.stage}: {currentStage.name}
                            </p>
                        </div>
                        <div className="flex justify-between items-center">
                            {item.txHash ? (
                                <div className="flex items-center gap-2">
                                    <a 
                                        href={`https://sepolia.etherscan.io/tx/${item.txHash}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:underline"
                                    >
                                        View Transaction
                                    </a>
                                    <CopyButton textToCopy={item.txHash} />
                                </div>
                            ) : <div />}
                            <button 
                                onClick={() => onShowHistory(item)}
                                className="text-xs font-semibold py-1 px-3 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
                            >
                                🌌 View History
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                    {item.txHash && (
                        <div className="mt-auto pt-4 border-t border-slate-200/60 flex items-center gap-2">
                            <a 
                                href={`https://sepolia.etherscan.io/tx/${item.txHash}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline"
                            >
                                View Transaction
                            </a>
                            <CopyButton textToCopy={item.txHash} />
                        </div>
                    )}
                    </>
                )}
            </div>
        </Card>
    );
};

const RARITIES = ['All', 'Common', 'Rare', 'Epic', 'Legendary'] as const;
type RarityFilter = (typeof RARITIES)[number];

const HallOfOrigins: React.FC<HallOfOriginsProps> = ({ items, loading, onMint, isMinting, evolvingNftId, newlyMintedNftId, onShowHistory }) => {
  const [filter, setFilter] = useState<RarityFilter>('All');

  const filteredItems = useMemo(() => {
    if (filter === 'All') return items;
    return items.filter(item => item.rarity === filter);
  }, [items, filter]);

  const handleShowHistory = (nft: NFT) => {
    onShowHistory(nft);
  };

  const getFilterStyle = (r: RarityFilter) => {
    if (filter !== r) return 'bg-slate-100 text-slate-600 hover:bg-slate-200';
    switch (r) {
      case 'Common': return 'bg-slate-500 text-white shadow-md';
      case 'Rare': return 'bg-blue-500 text-white shadow-md';
      case 'Epic': return 'bg-purple-500 text-white shadow-md';
      case 'Legendary': return 'bg-amber-500 text-white shadow-md';
      default: return 'bg-slate-800 text-white shadow-md';
    }
  };

  return (
    <>
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">🏛️ Hall of Origins</h2>
            <div className="flex flex-wrap gap-2 mt-3">
              {RARITIES.map((r) => (
                <button
                  key={r}
                  onClick={() => setFilter(r)}
                  className={`px-3 py-1 text-xs font-bold rounded-full transition-all duration-200 uppercase tracking-wider ${getFilterStyle(r)}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => onMint()}
            disabled={isMinting}
            className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition-colors duration-300 disabled:bg-purple-300 disabled:cursor-not-allowed self-start sm:self-center"
          >
            {isMinting ? (
                <>
                  <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                  Minting...
                </>
            ) : (
              "✨ Mint a Random MeeBot"
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {loading && Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="flex flex-col">
              <LoadingSkeleton className="w-full h-48" />
              <div className="p-4">
                <LoadingSkeleton className="h-6 w-3/4 mb-2" />
                <LoadingSkeleton className="h-4 w-full" />
                <LoadingSkeleton className="h-4 w-5/6 mt-1" />
              </div>
            </Card>
          ))}
          {!loading && filteredItems.map((item, i) => 
            <NFTCard 
              key={item.id} 
              item={item} 
              onShowHistory={handleShowHistory} 
              isEvolving={item.id === evolvingNftId}
              isNewlyMinted={item.id === newlyMintedNftId}
              style={{ animationDelay: `${i * 100}ms`}} 
            />
          )}
          {!loading && filteredItems.length === 0 && (
            <div className="col-span-2 py-12 text-center">
              <p className="text-slate-500">
                {items.length === 0 
                  ? "No NFTs found. Design and mint your first MeeBot to get started!"
                  : `No ${filter} MeeBots found in your collection.`}
              </p>
              {filter !== 'All' && items.length > 0 && (
                <button 
                  onClick={() => setFilter('All')}
                  className="mt-2 text-sm font-semibold text-purple-600 hover:underline"
                >
                  Clear filter
                </button>
              )}
            </div>
          )}
        </div>
      </Card>
    </>
  );
};

export default HallOfOrigins;