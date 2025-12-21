import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioUtils';

// --- Singleton Audio Context Management ---
// Manages a single AudioContext instance to ensure it's created only once
// and can be unlocked by user interaction to allow autoplay.
let audioContext: AudioContext | null = null;
const getAudioContext = (): AudioContext | null => {
    if (typeof window !== 'undefined' && !audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    return audioContext;
};

const unlockAudioContext = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
        ctx.resume();
    }
};


interface MeeBotWidgetProps {
  // FIX: Added 'celebratory' to the mood type to align with TimelineEvent mood types.
  mood: 'joyful' | 'curious' | 'helpful' | 'celebratory';
  message: string;
}

const MeeBotIcon = () => (
    <div className="relative w-16 h-16 meebot-float">
        <div className="absolute inset-0 bg-blue-400 rounded-full animate-pulse opacity-20"></div>
        <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full shadow-lg text-3xl">
            🤖
        </div>
    </div>
);

const MeeBotWidget: React.FC<MeeBotWidgetProps> = ({ message }) => {
  const [isLoadingAudio, setIsLoadingAudio] = useState(true);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const hasAutoplayed = useRef(false);

  // Effect to initialize and unlock the audio context on the first user interaction
  useEffect(() => {
    getAudioContext(); // Ensure the context is created on component mount
    document.addEventListener('click', unlockAudioContext, { once: true });
    document.addEventListener('keydown', unlockAudioContext, { once: true });
    
    // The appearance animation is now handled by a CSS class.
    
    return () => {
      // Listeners are not removed as they are { once: true } and global for the page session
    };
  }, []);

  const playAudio = useCallback(() => {
    const ctx = getAudioContext();
    if (audioBuffer && ctx) {
      if (ctx.state === 'suspended') {
        ctx.resume().then(() => {
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            source.start();
        });
      } else {
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.start();
      }
    }
  }, [audioBuffer]);
  
  // Effect to fetch the audio TTS when the message changes
  useEffect(() => {
    const fetchAndDecodeAudio = async () => {
        const ctx = getAudioContext();
        if (!message || !ctx) return;
        
        setIsLoadingAudio(true);
        setAudioBuffer(null);
        hasAutoplayed.current = false; // Reset autoplay flag for new message
        const base64Audio = await generateSpeech(message);
        if (base64Audio) {
            try {
                const decoded = decode(base64Audio);
                const buffer = await decodeAudioData(decoded, ctx, 24000, 1);
                setAudioBuffer(buffer);
            } catch (error) {
                console.error("Failed to decode audio:", error);
            }
        }
        setIsLoadingAudio(false);
    };

    fetchAndDecodeAudio();
  }, [message]);

  // Effect to AUTOPLAY audio once it's decoded and ready
  useEffect(() => {
    const ctx = getAudioContext();
    // Autoplay only if the audio context is running (unlocked) and we haven't played this message yet
    if (audioBuffer && ctx?.state === 'running' && !hasAutoplayed.current) {
      playAudio();
      hasAutoplayed.current = true;
    }
  }, [audioBuffer, playAudio]);

  return (
    <div className="animate-meebot-appear flex items-center gap-4 mb-8 p-4 bg-white/60 backdrop-blur-lg rounded-2xl shadow-md border border-white/50">
      <MeeBotIcon />
      <div className="flex-1">
        <p className="text-slate-700 font-medium">{message}</p>
      </div>
      <button
        onClick={playAudio}
        disabled={isLoadingAudio || !audioBuffer}
        className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 transition-all duration-200 disabled:bg-slate-300 disabled:cursor-not-allowed transform hover:scale-105 disabled:scale-100"
        aria-label="Play welcome message"
      >
        {isLoadingAudio ? (
            <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )}
      </button>
    </div>
  );
};

export default MeeBotWidget;