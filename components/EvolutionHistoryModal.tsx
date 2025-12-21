import React, { useState } from 'react';
import { NFT, EvolutionStage } from '../types';
import { getAudioContext, playBase64Audio } from '../utils/audioUtils';
import CopyButton from './shared/CopyButton';

interface MeeBotCertificateModalProps {
  nft: NFT | null;
  onClose: () => void;
}

const EvolutionStageCard: React.FC<{ stage: EvolutionStage, index: number }> = ({ stage, index }) => {
    // Split description into main part and prompt part for styling
    const [mainDesc, promptDesc] = stage.description.includes("Prompt: ") 
        ? stage.description.split("Prompt: ") 
        : [stage.description, ''];

    return (
        <div className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-white rounded-lg border border-slate-200/80 shadow-sm animate-fade-in-up" style={{ animationDelay: `${index * 150}ms`}}>
            <img src={stage.imageUrl} alt={stage.name} className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg object-cover shrink-0" />
            <div className="flex-grow pt-1">
                <p className="text-sm font-bold text-purple-600">Stage {stage.stage}</p>
                <h3 className="text-lg font-bold text-slate-800 -mt-1">{stage.name}</h3>
                <p className="text-xs text-slate-500 mt-1 mb-3">{new Date(stage.timestamp).toLocaleString()}</p>
                
                <div className="space-y-1 text-sm text-slate-600">
                    <p><strong className="font-semibold text-slate-700">Trigger:</strong> {stage.triggerEvent}</p>
                    <p>{mainDesc.replace('Prompt: ""', '')}</p>
                    {promptDesc && <p><strong className="font-semibold text-slate-700">Prompt:</strong> "{promptDesc}"</p>}
                </div>
            </div>
        </div>
    )
}


const MeeBotCertificateModal: React.FC<MeeBotCertificateModalProps> = ({ nft, onClose }) => {
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [shareText, setShareText] = useState('Share');

  if (!nft) return null;

  const stages = nft.evolutionStages || [];
  const isBirthCertificate = stages.length === 1;

  const handlePlayAudio = async () => {
      if (!nft.firstWords) return;
      const ctx = getAudioContext();
      if (ctx) {
          setIsAudioLoading(true);
          await playBase64Audio(nft.firstWords, ctx);
          setIsAudioLoading(false);
      }
  };

  const handleShare = async () => {
    if (!nft) return;
    const certificateText = `Behold the birth of my MeeBot on MeeChain!
    
Name: ${nft.name}
Rarity: ${nft.rarity}
Transaction: ${nft.txHash}`;

    try {
        await navigator.clipboard.writeText(certificateText);
        setShareText('Copied!');
        setTimeout(() => setShareText('Share'), 2000);
    } catch (err) {
        console.error('Failed to copy text: ', err);
        setShareText('Failed to copy');
        setTimeout(() => setShareText('Share'), 2000);
    }
  };


  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in-up" 
        style={{ animationDuration: '0.3s' }}
        onClick={onClose}
    >
      <div 
        className="relative bg-slate-50/80 backdrop-blur-lg rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-white/50"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 transition-colors z-10"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {isBirthCertificate ? (
            <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-md overflow-hidden">
                        <img src={nft.imageUrl} alt={nft.name} className="w-full h-full object-cover"/>
                    </div>
                    <p className="text-xs font-semibold text-slate-600 mt-1 max-w-[64px] truncate">{nft.name}</p>
                </div>
                <div className="flex-1 pt-1">
                    <h2 className="text-2xl font-extrabold text-slate-800">MeeBot Birth Certificate</h2>
                    <p className="text-slate-500">A record of a new beginning.</p>
                </div>
            </div>
        ) : (
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
                <img src={nft.imageUrl} alt={nft.name} className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md"/>
                <div className="flex-1">
                    <h2 className="text-2xl font-extrabold text-slate-800">{`History of ${nft.name}`}</h2>
                    <p className="text-slate-500">From birth to its current form.</p>
                </div>
            </div>
        )}
        
        {isBirthCertificate && nft.txHash && (
            <div className="flex items-center justify-between gap-2 p-3 bg-slate-100 rounded-lg mb-4 border border-slate-200/80 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <div>
                    <p className="text-xs font-semibold text-slate-500">Transaction Hash</p>
                    <p className="text-sm font-mono text-slate-700 truncate" title={nft.txHash}>
                        {nft.txHash}
                    </p>
                </div>
                <CopyButton textToCopy={nft.txHash} />
            </div>
        )}

        {!isBirthCertificate && nft.firstWords && (
            <div className="mb-6">
                <button
                    onClick={handlePlayAudio}
                    disabled={isAudioLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-sky-100 text-sky-700 font-semibold rounded-lg shadow-sm hover:bg-sky-200 transition-colors duration-300 disabled:bg-slate-200 disabled:cursor-not-allowed"
                >
                    {isAudioLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-t-transparent border-sky-600 rounded-full animate-spin"></div>
                            <span>Playing...</span>
                        </>
                    ) : (
                       <>
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8.072v3.856a1 1 0 001.555.832l3.197-1.928a1 1 0 000-1.664l-3.197-1.928z" /></svg>
                         <span>Listen to First Words</span>
                       </>
                    )}
                </button>
            </div>
        )}

        <div className="space-y-4">
            {stages
                .slice() // Create a shallow copy to avoid mutating the original array
                .sort((a, b) => a.stage - b.stage) // Sort by stage number just in case
                .map((stage, index) => (
                    <EvolutionStageCard key={stage.stage} stage={stage} index={index} />
                ))}
        </div>

        <div className="mt-6 flex justify-end">
             <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 font-semibold rounded-lg shadow-sm hover:bg-purple-200 transition-colors duration-300"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                {shareText}
            </button>
        </div>

      </div>
    </div>
  );
};

export default MeeBotCertificateModal;