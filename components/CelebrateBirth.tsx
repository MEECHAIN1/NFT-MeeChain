import React, { useEffect, useState } from 'react';
import { NFT } from '../types';
import { generateSpeech } from '../services/geminiService';
import { getAudioContext, playBase64Audio } from '../utils/audioUtils';

interface CelebrateBirthProps {
    nft: NFT;
    onDone: () => void;
}

const CelebrateBirth: React.FC<CelebrateBirthProps> = ({ nft, onDone }) => {
    const [isAudioLoading, setIsAudioLoading] = useState(true);
    const [shareText, setShareText] = useState('Share');

    const playFirstWords = async () => {
        const greeting = `Thank you for giving me life, Creator. My name is ${nft.name}.`;
        setIsAudioLoading(true);
        const audioData = await generateSpeech(greeting);
        if (audioData) {
            const ctx = getAudioContext();
            if (ctx) await playBase64Audio(audioData, ctx);
        }
        setIsAudioLoading(false);
    };
    
    // Auto-play TTS on mount
    useEffect(() => {
        playFirstWords();
    }, [nft.id]); // Re-trigger if a new NFT is celebrated without unmounting

    const handleShare = async () => {
        const certificateText = `Behold the birth of my MeeBot on MeeChain!
    
Name: ${nft.name}
Description: ${nft.description}
Rarity: ${nft.rarity}
Transaction: ${nft.txHash}`;

        try {
            await navigator.clipboard.writeText(certificateText);
            setShareText('Copied!');
            setTimeout(() => setShareText('Share'), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (
        <div className="text-center animate-fade-in-up space-y-4">
            <h3 className="text-xl font-bold text-purple-700 flex items-center justify-center gap-2">
                <span className="text-yellow-400 text-base">✨</span>
                Congratulations! Your MeeBot is born!
                <span className="text-yellow-400 text-base">✨</span>
            </h3>
            <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-white/30 max-w-sm mx-auto">
                <div className="w-24 h-24 rounded-full mx-auto bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                    <img src={nft.imageUrl} alt={nft.name} className="w-full h-full object-cover" />
                </div>
                <h4 className="font-bold text-lg mt-2">{nft.name}</h4>
                <p className="text-sm text-slate-600 px-2">{nft.description}</p>
            </div>
            <p className="text-slate-500 italic text-sm">A voice echoes: "Thank you for giving me life..."</p>
            
            <div className="flex justify-center flex-wrap gap-3">
                <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 font-semibold rounded-lg shadow-sm hover:bg-purple-200 transition-colors duration-300"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                    {shareText}
                </button>
                 <button onClick={onDone} className="px-6 py-2 bg-slate-700 text-white font-semibold rounded-lg shadow-md hover:bg-slate-800 transition-colors">
                    Create Another
                </button>
            </div>
        </div>
    );
};

export default CelebrateBirth;