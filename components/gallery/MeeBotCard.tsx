import React, { useState } from 'react';
import { NFT } from '../../types';
import { getAudioContext, playBase64Audio } from '../../utils/audioUtils';
import CopyButton from '../shared/CopyButton';

interface MeeBotCardProps {
    meebot: NFT;
}

const getEtherscanLink = (txHash: string, network: 'testnet' | 'mainnet' | undefined) => {
  const baseUrl = network === 'mainnet' ? 'https://etherscan.io/tx/' : 'https://sepolia.etherscan.io/tx/';
  return `${baseUrl}${txHash}`;
};

export const MeeBotCard: React.FC<MeeBotCardProps> = ({ meebot }) => {
  const { name, evolutionStages, id, imageUrl, network, txHash, firstWords } = meebot;
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  const handlePlayVoice = async () => {
    if (!firstWords) return;
    const ctx = getAudioContext();
    if (ctx) {
        setIsAudioLoading(true);
        await playBase64Audio(firstWords, ctx);
        setIsAudioLoading(false);
    }
  };
  
  const bornAt = evolutionStages?.[0]?.timestamp;

  return (
    <div className="bg-white/80 rounded-lg shadow-md overflow-hidden transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl">
      <img src={imageUrl} alt={name} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="font-bold text-lg text-slate-800">{name}</h3>
        {bornAt && <p className="text-sm text-slate-500 mt-1">🎂 Born: {new Date(bornAt).toLocaleDateString()}</p>}
        <p className="text-sm text-slate-500 mt-1">🆔 ID: {id.slice(0, 10)}...</p>
        
        {firstWords && (
            <button 
                onClick={handlePlayVoice}
                disabled={isAudioLoading}
                className="mt-4 w-full flex items-center justify-center gap-2 text-sm font-semibold py-2 px-3 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors disabled:bg-slate-200/50 disabled:cursor-not-allowed"
            >
            {isAudioLoading ? (
                <>
                 <div className="w-4 h-4 border-2 border-t-transparent border-slate-500 rounded-full animate-spin"></div>
                 Playing...
                </>
            ) : "🔊 First Words" }
            </button>
        )}
        
        {txHash && (
          <div className="mt-2 flex items-center justify-between bg-slate-100 rounded-md">
            <a 
              href={getEtherscanLink(txHash, network)} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex-grow text-sm font-semibold py-2 px-3 text-slate-700 hover:bg-slate-200 rounded-l-md transition-colors"
            >
              🔗 View on Etherscan
            </a>
            <div className="border-l border-slate-200 h-6 my-auto"></div>
            <div className="p-1.5">
                <CopyButton textToCopy={txHash} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeeBotCard;