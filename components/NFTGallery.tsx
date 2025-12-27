import React, { useState, useMemo } from 'react';
import { NFT } from '../types';
import Card from './shared/Card';
import LoadingSkeleton from './shared/LoadingSkeleton';
import { getAudioContext, playBase64Audio } from '../utils/audioUtils';
import CopyButton from './shared/CopyButton';

interface NFTGalleryProps {
  items: NFT[];
  loading: boolean;
  onMint: () => void;
  isMinting: boolean;
  evolvingNftId: string | null;
  newlyMintedNftId: string | null;
  onShowHistory: (nft: NFT) => void;
}

const RARITIES = ['All', 'Common', 'Rare', 'Epic', 'Legendary'] as const;
type RarityFilter = (typeof RARITIES)[number];

type SortOption = 'Date' | 'Name' | 'Rarity';

const RARITY_ORDER: Record<NFT['rarity'], number> = {
  'Legendary': 4,
  'Epic': 3,
  'Rare': 2,
  'Common': 1
};

const RarityPill: React.FC<{ rarity: NFT['rarity'] }> = ({ rarity }) => {
  const colorMap = {
    Common: 'bg-slate-200 text-slate-800',
    Rare: 'bg-blue-100 text-blue-800',
    Epic: 'bg-purple-100 text-purple-800',
    Legendary: 'bg-amber-100 text-amber-800 border border-amber-200',
  };
  return (
    <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm ${colorMap[rarity]}`}>
      {rarity}
    </span>
  );
};

const NFTCard: React.FC<{ item: NFT, onShowHistory: (nft: NFT) => void, isEvolving: boolean, isNewlyMinted: boolean, style?: React.CSSProperties }> = ({ item, onShowHistory, isEvolving, isNewlyMinted, style }) => {
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const [showLedger, setShowLedger] = useState(false);

    const handlePlayAudio = async () => {
        if (!item.firstWords) return;
        const ctx = getAudioContext();
        if (ctx) {
            setIsAudioLoading(true);
            await playBase64Audio(item.firstWords, ctx);
            setIsAudioLoading(false);
        }
    };
    
    const currentStage = item.evolutionStages?.[item.evolutionStages.length - 1];
    const etherscanUrl = item.network === 'mainnet' 
        ? `https://etherscan.io/tx/${item.txHash}` 
        : `https://sepolia.etherscan.io/tx/${item.txHash}`;

    return (
        <Card className={`group flex flex-col h-full ${isNewlyMinted ? 'animate-crystal-burst' : 'animate-fade-in-up'} ${isEvolving ? 'evolve' : ''}`} style={style}>
            <div className="relative overflow-hidden aspect-square">
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <RarityPill rarity={item.rarity} />
                
                {item.firstWords && (
                     <button 
                        onClick={handlePlayAudio}
                        disabled={isAudioLoading}
                        className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md text-sky-600 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all duration-300 shadow-xl disabled:opacity-50"
                        aria-label="Play Voice"
                     >
                       {isAudioLoading ? (
                           <div className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin"></div>
                       ) : (
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                             <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 14.657a1 1 0 01-1.414-1.414A3 3 0 0013.5 11a3 3 0 00-.257-2.243 1 1 0 011.414-1.414A5 5 0 0115 11a5 5 0 01-.343 3.657z" clipRule="evenodd" />
                           </svg>
                       )}
                    </button>
                )}
            </div>
            
            <div className="p-4 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-slate-900 group-hover:text-purple-600 transition-colors">{item.name}</h3>
                </div>
                <p className="text-slate-500 text-xs line-clamp-2 mb-4">{item.description}</p>
                
                {/* Collapsible Ledger Section */}
                <div className="mb-4">
                  <button 
                    onClick={() => setShowLedger(!showLedger)}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-blue-500 uppercase tracking-wider transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 transition-transform ${showLedger ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                    </svg>
                    {showLedger ? 'Hide Transaction History' : 'View Transaction Ledger'}
                  </button>
                  
                  {showLedger && (
                    <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-2 animate-fade-in-up">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400 font-bold uppercase">Status</span>
                        <span className="flex items-center gap-1 text-green-600 font-black">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                          CONFIRMED
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400 font-bold uppercase">Network</span>
                        <span className="text-slate-600 font-bold uppercase">{item.network || 'Sepolia'}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-200">
                        <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">Hash Identifier</p>
                        <div className="flex items-center justify-between bg-white p-1.5 rounded border border-slate-100">
                          <code className="text-[10px] text-blue-600 font-mono truncate mr-2">{item.txHash || 'Pending...'}</code>
                          {item.txHash && <CopyButton textToCopy={item.txHash} className="p-0.5" />}
                        </div>
                      </div>
                      <a 
                        href={etherscanUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="block text-center w-full py-1.5 bg-blue-50 text-blue-600 text-[10px] font-black rounded hover:bg-blue-100 transition-colors uppercase tracking-widest"
                      >
                        Explore On Etherscan ↗
                      </a>
                    </div>
                  )}
                </div>

                <div className="mt-auto space-y-3">
                    {currentStage && (
                        <div className="p-2 bg-purple-50 rounded-lg border border-purple-100">
                            <p className="text-[10px] font-bold text-purple-400 uppercase tracking-tighter">Current Evolution</p>
                            <p className="text-xs font-semibold text-purple-700 truncate">Stage {currentStage.stage}: {currentStage.name}</p>
                        </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Authenticated</span>
                        </div>
                        <button 
                            onClick={() => onShowHistory(item)}
                            className="text-[10px] font-bold text-slate-400 hover:text-purple-600 uppercase tracking-widest transition-colors"
                        >
                            History →
                        </button>
                    </div>
                </div>
            </div>
        </Card>
    );
};

const NFTGallery: React.FC<NFTGalleryProps> = ({ items, loading, onMint, isMinting, evolvingNftId, newlyMintedNftId, onShowHistory }) => {
  const [filter, setFilter] = useState<RarityFilter>('All');
  const [sortBy, setSortBy] = useState<SortOption>('Date');

  const processedItems = useMemo(() => {
    let result = [...items];

    // Apply Filter
    if (filter !== 'All') {
      result = result.filter(item => item.rarity === filter);
    }

    // Apply Sort
    result.sort((a, b) => {
      if (sortBy === 'Name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'Rarity') {
        return (RARITY_ORDER[b.rarity] || 0) - (RARITY_ORDER[a.rarity] || 0);
      } else {
        // Default: Date (Newest first)
        const dateA = new Date(a.evolutionStages?.[0]?.timestamp || 0).getTime();
        const dateB = new Date(b.evolutionStages?.[0]?.timestamp || 0).getTime();
        return dateB - dateA;
      }
    });

    return result;
  }, [items, filter, sortBy]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Hall of Origins</h2>
          <p className="text-slate-500 text-sm">Your unique collection of MeeBot companions.</p>
          
          <div className="flex flex-wrap items-center gap-4 mt-4">
            {/* Rarity Filter */}
            <div className="flex flex-wrap gap-2">
              {RARITIES.map((r) => (
                <button
                  key={r}
                  onClick={() => setFilter(r)}
                  className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all duration-300 uppercase tracking-widest border ${
                    filter === r 
                      ? 'bg-slate-800 text-white border-slate-800 shadow-md' 
                      : 'bg-white text-slate-500 border-slate-200 hover:border-purple-300 hover:text-purple-600'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Sort Selection */}
            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md rounded-full px-3 py-1 border border-slate-200 ml-auto">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Sort By:</span>
                <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="bg-transparent text-[10px] font-bold text-slate-700 uppercase focus:outline-none cursor-pointer"
                >
                    <option value="Date">Newest</option>
                    <option value="Name">Name A-Z</option>
                    <option value="Rarity">Rarity ↓</option>
                </select>
            </div>
          </div>
        </div>

        <button
          onClick={onMint}
          disabled={isMinting}
          className="relative group overflow-hidden px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black rounded-xl shadow-lg hover:shadow-purple-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 active:scale-95 shrink-0"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <span className="relative flex items-center justify-center gap-2">
            {isMinting ? (
                <>
                  <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                  <span>MINTING SOUL...</span>
                </>
            ) : (
              <>
                <span className="text-xl">✨</span>
                <span>MINT NEW NFT</span>
              </>
            )}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-6">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="flex flex-col">
              <LoadingSkeleton className="w-full aspect-square" />
              <div className="p-4 space-y-3">
                <LoadingSkeleton className="h-5 w-3/4" />
                <LoadingSkeleton className="h-4 w-full" />
                <LoadingSkeleton className="h-8 w-full mt-4" />
              </div>
            </Card>
          ))
        ) : processedItems.length > 0 ? (
          processedItems.map((item, i) => 
            <NFTCard 
              key={item.id} 
              item={item} 
              onShowHistory={onShowHistory} 
              isEvolving={item.id === evolvingNftId}
              isNewlyMinted={item.id === newlyMintedNftId}
              style={{ animationDelay: `${i * 100}ms`}} 
            />
          )
        ) : (
          <div className="col-span-full py-20 text-center bg-white/30 backdrop-blur-sm rounded-2xl border-2 border-dashed border-slate-200">
            <div className="text-4xl mb-4 opacity-50">🛸</div>
            <p className="text-slate-500 font-medium">
              {items.length === 0 
                ? "Your hall is currently empty. Mint your first MeeBot to begin the journey!"
                : `No ${filter} rarity MeeBots found.`}
            </p>
            {filter !== 'All' && (
              <button onClick={() => setFilter('All')} className="mt-2 text-sm text-purple-600 font-bold hover:underline">Show All</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTGallery;