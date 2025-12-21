import React from 'react';
import { TimelineEvent, TimelineEventType, NFT } from '../types';
import MeeBotWidget from './MeeBotWidget';
import LoadingSkeleton from './shared/LoadingSkeleton';
import CopyButton from './shared/CopyButton';

interface ContributorTimelineProps {
  events: TimelineEvent[];
  loading: boolean;
  nfts: NFT[];
  onViewCertificate: (nft: NFT) => void;
}

// Sub-components for each event type for better organization
const MintEventCard: React.FC<{ event: TimelineEvent; onViewCertificate: () => void; }> = ({ event, onViewCertificate }) => (
  <div className="border rounded-lg p-4 space-y-3 bg-slate-50/50">
    <div className="flex justify-between items-center">
        <p className="font-semibold text-slate-800">{event.title}</p>
        <p className="text-xs text-slate-400">{new Date(event.timestamp).toLocaleString()}</p>
    </div>
    <div className="flex gap-4 items-center">
        {event.imageUrl && <img src={event.imageUrl} alt="MeeBot NFT" className="rounded-lg w-24 h-24 object-cover glow" />}
        <div className="flex-1 space-y-2">
            <p className="text-sm text-slate-600">{event.description}</p>
            <div className="flex gap-4 items-center">
                 {event.txHash && (
                    <div className="flex items-center gap-2">
                        <a href={`https://sepolia.etherscan.io/tx/${event.txHash}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-600 hover:underline">
                            View Transaction
                        </a>
                        <CopyButton textToCopy={event.txHash} />
                    </div>
                )}
                <button onClick={onViewCertificate} className="text-sm font-semibold text-purple-600 hover:underline">
                    View Certificate
                </button>
            </div>
        </div>
    </div>
  </div>
);

const BadgeEventCard: React.FC<{ event: TimelineEvent }> = ({ event }) => (
    <div className="border rounded-lg p-4 space-y-2 bg-slate-50/50">
        <div className="flex justify-between items-center">
            <p className="font-semibold text-slate-800">{event.title}</p>
            <p className="text-xs text-slate-400">{new Date(event.timestamp).toLocaleString()}</p>
        </div>
        <MeeBotWidget mood="joyful" message={`Congratulations! You've earned the "${event.badgeName}" badge! 🎉`} />
    </div>
);

const MoodAnalysisEventCard: React.FC<{ event: TimelineEvent }> = ({ event }) => (
  <div className="border rounded-lg p-4 space-y-2 bg-slate-50/50">
    <div className="flex justify-between items-center">
        <p className="font-semibold text-slate-800">{event.title}</p>
        <p className="text-xs text-slate-400">{new Date(event.timestamp).toLocaleString()}</p>
    </div>
    <MeeBotWidget mood={event.mood || 'helpful'} message={`MeeBot senses a ${event.mood} mood in your recent activities! Keep up the great work. 💜`} />
    <div className="text-sm text-slate-600 pl-4 border-l-2 border-purple-200/80 mt-2 space-y-1">
        <p><strong>🧠 Analysis:</strong> {event.description}</p>
        <p><strong>🤔 Context:</strong> {event.context}</p>
    </div>
  </div>
);

const EvolutionEventCard: React.FC<{ event: TimelineEvent; onViewCertificate: () => void; }> = ({ event, onViewCertificate }) => (
    <div className="border-2 border-purple-300/80 rounded-lg p-4 space-y-3 bg-gradient-to-br from-purple-50 to-sky-50 shadow-inner">
        <div className="flex justify-between items-center">
            <p className="font-bold text-lg text-purple-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                </svg>
                {event.title}
            </p>
            <p className="text-xs text-slate-400">{new Date(event.timestamp).toLocaleString()}</p>
        </div>
        <div className="flex gap-4 items-center">
            {event.imageUrl && <img src={event.imageUrl} alt="Evolved MeeBot" className="rounded-lg w-24 h-24 object-cover border-2 border-white shadow-md" />}
            <div className="flex-1 space-y-2">
                <p className="text-sm text-slate-700">{event.description}</p>
                <button onClick={onViewCertificate} className="text-sm font-semibold text-purple-600 hover:underline">
                    View Full History
                </button>
            </div>
        </div>
    </div>
);

// Fallback for other event types
const DefaultEventCard: React.FC<{ event: TimelineEvent }> = ({ event }) => (
     <div className="border rounded-lg p-4 bg-slate-50/50">
        <div className="flex justify-between items-center">
            <p className="font-semibold text-slate-800">{event.title}</p>
            <p className="text-xs text-slate-400">{new Date(event.timestamp).toLocaleString()}</p>
        </div>
        <p className="text-sm text-slate-600 mt-1">{event.description}</p>
    </div>
);


const ContributorTimeline: React.FC<ContributorTimelineProps> = ({ events, loading, nfts, onViewCertificate }) => {

  const renderEvent = (event: TimelineEvent) => {
    
    const handleViewCertificate = (nftId?: string) => {
        if (!nftId) return;
        const nftToShow = nfts.find(n => n.id === nftId);
        if (nftToShow) {
            onViewCertificate(nftToShow);
        }
    };

    switch (event.type) {
      case TimelineEventType.Mint:
        return <MintEventCard event={event} onViewCertificate={() => handleViewCertificate(event.nftId)} />;
      case TimelineEventType.Badge:
        return <BadgeEventCard event={event} />;
      case TimelineEventType.MoodAnalysis:
        return <MoodAnalysisEventCard event={event} />;
      case TimelineEventType.Evolution:
        return <EvolutionEventCard event={event} onViewCertificate={() => handleViewCertificate(event.nftId)} />;
      default:
        return <DefaultEventCard event={event} />;
    }
  };

  return (
    <div className="bg-white/50 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/50">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">🛤️ My Journey</h2>
      <div className="space-y-4">
        {loading && Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center mb-2">
                <LoadingSkeleton className="h-5 w-3/5" />
                <LoadingSkeleton className="h-4 w-1/4" />
            </div>
            <LoadingSkeleton className="h-16 w-full" />
          </div>
        ))}

        {!loading && events.map((event, i) => (
          <div key={event.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
            {renderEvent(event)}
          </div>
        ))}
        
        {!loading && events.length === 0 && <p className="text-slate-500">Your contributor journey will appear here.</p>}
      </div>
    </div>
  );
};

export default ContributorTimeline;