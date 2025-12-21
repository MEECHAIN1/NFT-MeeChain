import React, { useState } from 'react';
import { analyzeMoodFromPrompt } from '../services/geminiService';
import { useMintMeeBot } from '../services/contractService';
import { XP_VALUES } from '../services/dataService';
import Card from './shared/Card';
import { NFT } from '../types';
import { generateMeeBotImage } from '../services/imageService';
import { finalizeMeeBotBirth } from '../logic/genesisService';
import { SparklesIcon } from './shared/Icons';
import CelebrateBirth from './CelebrateBirth';

// Define the list of available personas
const PERSONAS = ['Crystal Core', 'Starlight Weaver', 'Quantum Thinker', 'Bio-Mechanic', 'Dream Painter', 'Chrono-Gardener', 'Default'];

interface MeeBotGenesisProps {
    onActionSuccess: (notification: string, meeBotMessage: string, xpToAdd?: number) => void;
    onMintSuccess: (nft: NFT) => void;
}

const MeeBotGenesis: React.FC<MeeBotGenesisProps> = ({ onActionSuccess, onMintSuccess }) => {
    // Form state
    const [persona, setPersona] = useState(PERSONAS[3]);
    const [prompt, setPrompt] = useState('a crystal MeeBot with a flower');
    
    // Flow state
    const [analyzedMood, setAnalyzedMood] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [mintedNft, setMintedNft] = useState<NFT | null>(null);
    
    // Loading states
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isPreparing, setIsPreparing] = useState(false);

    const { write: mintNFT, isLoading: isMinting } = useMintMeeBot({
        onSuccess: async (preparedMetadata: any) => {
            const newNft = await finalizeMeeBotBirth(preparedMetadata, prompt);
            onActionSuccess('Custom MeeBot Minted!', `Your unique design has been minted as an NFT!`, XP_VALUES.MINT_DESIGNED);
            onMintSuccess(newNft);
            setMintedNft(newNft);
        }
    });

    const handleRandomizePersona = () => {
        // Exclude the currently selected persona to ensure a new one is always chosen
        const otherPersonas = PERSONAS.filter(p => p !== persona);
        const randomIndex = Math.floor(Math.random() * otherPersonas.length);
        const randomPersona = otherPersonas[randomIndex];
        setPersona(randomPersona);
    };
    
    const handleAnalyzeAndPrepare = async () => {
        if (!prompt) return;

        setIsAnalyzing(true);
        const moodResult = await analyzeMoodFromPrompt(prompt);
        setIsAnalyzing(false);

        if (!moodResult) {
            onActionSuccess('Analysis failed', 'My apologies, I could not determine the mood. Please try again.');
            return;
        }
        setAnalyzedMood(moodResult);
        onActionSuccess('Mood Analysis Complete!', `I sense a ${moodResult} mood in your words.`, 5);
        
        setIsPreparing(true);
        const imageResponse = await generateMeeBotImage(prompt);
        setIsPreparing(false);

        if (!imageResponse?.imageUrl) {
            onActionSuccess('Image generation failed!', 'MeeBot could not visualize your idea. Please try again.');
            return;
        }
        setGeneratedImage(imageResponse.imageUrl);
    };

    const handleMint = () => {
        if (!analyzedMood || !generatedImage) return;

        const nftNumber = Math.floor(Math.random() * 1000) + 9000;
        const preparedMetadata = {
          name: `MeeBot #${nftNumber}`,
          description: `A ${persona} MeeBot born from a feeling of ${analyzedMood} and curiosity. Prompt: "${prompt}"`,
          attributes: [
            { "trait_type": "Persona", "value": persona },
            { "trait_type": "Mood", "value": analyzedMood },
            { "trait_type": "Creator", "value": "You" },
            { "trait_type": "Birth Timestamp", "value": new Date().toISOString() }
          ],
          image: generatedImage
        };
        
        mintNFT(preparedMetadata);
    };

    const resetFlow = () => {
        setPersona(PERSONAS[0]);
        setPrompt('a happy MeeBot floating in a sea of stars');
        setAnalyzedMood(null);
        setGeneratedImage(null);
        setMintedNft(null);
    };

    const isBusy = isAnalyzing || isPreparing || isMinting;
    
    if (mintedNft) {
        return (
            <Card className="p-6 mb-8">
               <CelebrateBirth nft={mintedNft} onDone={resetFlow} />
            </Card>
        );
    }

    return (
        <Card className="p-6 mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">🧬 MeeBot Genesis Ritual</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Left Side: Form */}
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-slate-700">1. Choose Persona</label>
                            <button 
                                onClick={handleRandomizePersona} 
                                disabled={isBusy}
                                className="flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors disabled:text-slate-400 disabled:cursor-not-allowed"
                                title="Pick a random persona"
                            >
                                <SparklesIcon className="h-4 w-4" />
                                Randomize
                            </button>
                        </div>
                        <select value={persona} onChange={e => setPersona(e.target.value)} disabled={isBusy} className="w-full border-slate-300 rounded-lg px-4 py-2 shadow-sm focus:ring-purple-500 focus:border-purple-500 transition disabled:bg-slate-100">
                            {PERSONAS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">2. Describe your MeeBot's Soul</label>
                        <textarea
                            placeholder="e.g., a wise meebot reading an ancient book"
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            className="w-full border-slate-300 rounded-lg px-4 py-2 shadow-sm focus:ring-purple-500 focus:border-purple-500 transition disabled:bg-slate-100"
                            rows={3}
                            disabled={isBusy}
                        />
                    </div>
                     {!analyzedMood && !generatedImage && (
                        <button onClick={handleAnalyzeAndPrepare} disabled={isBusy || !prompt} className="w-full px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition-colors disabled:bg-purple-300">
                            {isAnalyzing ? 'Analyzing Mood...' : '✨ Analyze & Visualize'}
                        </button>
                    )}
                </div>

                {/* Right Side: Action & Preview */}
                <div className="text-center bg-slate-50/70 p-6 rounded-lg border border-slate-200/60 min-h-[220px] flex flex-col justify-center items-center">
                    {!generatedImage && !isBusy && (
                       <div className="text-slate-500">
                         <SparklesIcon className="w-10 h-10 mx-auto mb-2 text-purple-400" />
                         <p className="font-semibold">Your creation appears here.</p>
                         <p className="text-sm">Describe your MeeBot and click "Analyze" to begin.</p>
                       </div>
                    )}
                     {(isPreparing) && (
                        <p className="text-slate-600 font-semibold animate-pulse">Visualizing your idea...</p>
                     )}
                    
                    {analyzedMood && generatedImage && !isMinting && (
                        <div className="space-y-4 animate-fade-in-up w-full">
                            <div className="flex justify-center items-center gap-4">
                                <img src={generatedImage} alt="Generated MeeBot" className="w-24 h-24 rounded-lg bg-slate-200 object-cover shadow-md" />
                                <div>
                                    <p className="font-semibold text-slate-800">Visualization Complete!</p>
                                    <p className="text-sm text-slate-600">Your <strong className="text-purple-700 capitalize">{analyzedMood}</strong> MeeBot is ready.</p>
                                </div>
                            </div>
                            <button onClick={handleMint} disabled={isMinting} className="w-full px-5 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition-colors disabled:bg-green-300">
                                {isMinting ? 'Minting...' : 'Final Step: Mint NFT'}
                            </button>
                        </div>
                    )}
                    {isMinting && <p className="text-slate-600 font-semibold animate-pulse">Minting on the blockchain...</p>}
                </div>
            </div>
        </Card>
    );
};

export default MeeBotGenesis;
