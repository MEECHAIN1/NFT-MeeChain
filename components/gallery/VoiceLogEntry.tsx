import React, { useState } from 'react';
import { VoiceLog } from '../../types';
import { generateSpeech } from '../../services/geminiService';
import { getAudioContext, playBase64Audio } from '../../utils/audioUtils';

interface VoiceLogEntryProps {
    entry: VoiceLog;
}

export const VoiceLogEntry: React.FC<VoiceLogEntryProps> = ({ entry }) => {
  const { timestamp, mood, quote } = entry;
  const [isLoading, setIsLoading] = useState(false);

  const handleSpeak = async () => {
    setIsLoading(true);
    const audioData = await generateSpeech(quote);
    if (audioData) {
        const ctx = getAudioContext();
        if (ctx) {
            await playBase64Audio(audioData, ctx);
        }
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-slate-50/80 p-4 rounded-lg border border-slate-200/60">
      <p className="text-sm"><strong className="font-semibold text-slate-700">{new Date(timestamp).toLocaleString()}</strong> — a <span className="capitalize">{mood}</span> soul reflected:</p>
      <blockquote className="my-2 pl-4 border-l-4 border-purple-300 text-slate-600 italic">“{quote}”</blockquote>
      <button 
        onClick={handleSpeak} 
        disabled={isLoading}
        className="mt-2 flex items-center gap-2 text-sm font-semibold py-1 px-3 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors disabled:bg-purple-100/50"
       >
         {isLoading ? (
            <>
                <div className="w-4 h-4 border-2 border-t-transparent border-purple-500 rounded-full animate-spin"></div>
                Speaking...
            </>
         ) : (
            "🗣️ Speak"
         )}
        </button>
    </div>
  );
};

export default VoiceLogEntry;
