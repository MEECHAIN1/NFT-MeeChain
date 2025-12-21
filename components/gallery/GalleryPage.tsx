import React, { useState, useMemo } from 'react';
import { NFT, VoiceLog } from '../../types';
import NetworkTabs from './NetworkTabs';
import MeeBotCard from './MeeBotCard';
import VoiceLogEntry from './VoiceLogEntry';
import MintWarning from './MintWarning';
import LoadingSkeleton from '../shared/LoadingSkeleton';

interface GalleryPageProps {
    meebots: NFT[];
    meebotsLoading: boolean;
    voiceLogs: VoiceLog[];
    voiceLogsLoading: boolean;
}

const ALL_MOODS = 'All';
type MoodFilter = VoiceLog['mood'] | typeof ALL_MOODS;


export const GalleryPage: React.FC<GalleryPageProps> = ({ meebots, meebotsLoading, voiceLogs, voiceLogsLoading }) => {
  const [selectedNetwork, setSelectedNetwork] = useState<'testnet' | 'mainnet'>('testnet');
  const [moodFilter, setMoodFilter] = useState<MoodFilter>(ALL_MOODS);
  
  const filteredMeeBots = meebots.filter(m => (m.network || 'testnet') === selectedNetwork);
  
  // FIX: Explicitly type the Set with <MoodFilter> to resolve the 'unknown' type inference error on Array.from(moods).
  const availableMoods = useMemo((): MoodFilter[] => {
    const moods = new Set<MoodFilter>(
      voiceLogs
        .filter(v => v.network === selectedNetwork)
        .map(v => v.mood)
    );
    return [ALL_MOODS, ...Array.from(moods)];
  }, [voiceLogs, selectedNetwork]);

  // When network changes, if the current filter is not available on the new network, reset it.
  React.useEffect(() => {
      if (!availableMoods.includes(moodFilter)) {
          setMoodFilter(ALL_MOODS);
      }
  }, [availableMoods, moodFilter]);

  const filteredVoiceLogs = voiceLogs.filter(v => {
      const networkMatch = v.network === selectedNetwork;
      const moodMatch = moodFilter === ALL_MOODS || v.mood === moodFilter;
      return networkMatch && moodMatch;
  });

  return (
    <div className="bg-white/50 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/50">
      <NetworkTabs selected={selectedNetwork} onSelect={setSelectedNetwork} />
      <MintWarning network={selectedNetwork} />
      
      <section>
        <h2 className="text-2xl font-bold mb-4 text-slate-800">My Collection</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {meebotsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white/80 rounded-lg shadow-md overflow-hidden">
                    <LoadingSkeleton className="w-full h-48" />
                    <div className="p-4 space-y-2">
                        <LoadingSkeleton className="h-5 w-3/4" />
                        <LoadingSkeleton className="h-4 w-1/2" />
                    </div>
                </div>
            ))
          ) : filteredMeeBots.length > 0 ? (
            filteredMeeBots.map(m => <MeeBotCard key={m.id} meebot={m} />)
          ) : (
            <p className="text-slate-500 col-span-full">ยังไม่มี MeeBot บนเครือข่ายนี้ครับ 🎈</p>
          )}
        </div>
      </section>
      
      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 className="text-2xl font-bold text-slate-800">📖 Voice Log</h2>
            {availableMoods.length > 1 && !voiceLogsLoading && (
                <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-slate-600">Filter by mood:</span>
                {availableMoods.map(mood => (
                    <button 
                    key={mood}
                    onClick={() => setMoodFilter(mood)}
                    className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors duration-200 capitalize ${
                        moodFilter === mood 
                        ? 'bg-purple-500 text-white shadow' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    >
                    {mood}
                    </button>
                ))}
                </div>
            )}
        </div>
        <div className="space-y-3">
          {voiceLogsLoading ? (
             Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="bg-slate-50/80 p-4 rounded-lg border border-slate-200/60 space-y-2">
                    <LoadingSkeleton className="h-4 w-3/4"/>
                    <LoadingSkeleton className="h-8 w-full"/>
                </div>
            ))
          ) : filteredVoiceLogs.length > 0 ? (
            filteredVoiceLogs.map(v => <VoiceLogEntry key={v.id} entry={v} />)
          ) : (
            <p className="text-slate-500">No voice logs found for this network or filter.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default GalleryPage;