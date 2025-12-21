import React from 'react';
import { Proposal, ProposalStatus } from '../types';
import Card from './shared/Card';
import LoadingSkeleton from './shared/LoadingSkeleton';

interface ProposalGridProps {
  items: Proposal[];
  loading: boolean;
  onVote: (proposalId: string, support: boolean) => void;
  votingOnProposalId: string | null;
}

const StatusPill: React.FC<{ status: ProposalStatus }> = ({ status }) => {
  const colorMap = {
    [ProposalStatus.Active]: 'bg-blue-100 text-blue-800 ring-blue-500/10',
    [ProposalStatus.Passed]: 'bg-green-100 text-green-800 ring-green-500/10',
    [ProposalStatus.Failed]: 'bg-red-100 text-red-800 ring-red-500/10',
    [ProposalStatus.Pending]: 'bg-yellow-100 text-yellow-800 ring-yellow-500/10',
  };
  return <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${colorMap[status]}`}>{status}</span>;
};

// FIX: Add className to props and apply it to the Card component.
const ProposalCard: React.FC<{ item: Proposal; onVote: ProposalGridProps['onVote']; votingOnProposalId: string | null; style?: React.CSSProperties; className?: string; }> = ({ item, onVote, votingOnProposalId, style, className }) => {
  const totalVotes = (item.votesFor ?? 0) + (item.votesAgainst ?? 0);
  const forPercentage = totalVotes > 0 ? ((item.votesFor ?? 0) / totalVotes) * 100 : 0;
  const isVoting = votingOnProposalId === item.id;
  
  return (
    <Card className={`flex flex-col p-4 ${className || ''}`} style={style}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-md text-slate-900 pr-2">{item.title}</h3>
        <StatusPill status={item.status} />
      </div>
      <p className="text-slate-600 text-sm mb-4 flex-grow">{item.summary}</p>
      {item.status !== ProposalStatus.Pending && (
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>For: {(item.votesFor ?? 0).toLocaleString()}</span>
            <span>Against: {(item.votesAgainst ?? 0).toLocaleString()}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-green-500 h-2.5 rounded-full transition-all duration-500 ease-in-out" style={{ width: `${forPercentage}%` }}></div>
          </div>
        </div>
      )}
      {item.status === ProposalStatus.Active && (
        <div className="flex gap-2 mt-4">
            <button disabled={isVoting} onClick={() => onVote(item.id, true)} className="flex-1 text-sm font-semibold py-1.5 px-3 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-green-300 transition-colors">For</button>
            <button disabled={isVoting} onClick={() => onVote(item.id, false)} className="flex-1 text-sm font-semibold py-1.5 px-3 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-red-300 transition-colors">Against</button>
            {isVoting && <div className="w-5 h-5 border-2 border-t-transparent border-slate-500 rounded-full animate-spin"></div>}
        </div>
      )}
    </Card>
  );
}

const ProposalGrid: React.FC<ProposalGridProps> = ({ items, loading, onVote, votingOnProposalId }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-slate-800">Proposals</h2>
      <div className="space-y-4">
        {loading && Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-4 space-y-3">
            <div className="flex justify-between">
              <LoadingSkeleton className="h-5 w-3/5" />
              <LoadingSkeleton className="h-5 w-1/4" />
            </div>
            <LoadingSkeleton className="h-4 w-full" />
            <LoadingSkeleton className="h-4 w-5/6" />
          </Card>
        ))}
        {!loading && items.map((item, i) => 
          <ProposalCard 
            key={item.id} 
            item={item} 
            onVote={onVote} 
            votingOnProposalId={votingOnProposalId} 
            style={{ animationDelay: `${i * 100}ms`}}
            className="animate-fade-in-up"
          />
        )}
        {!loading && items.length === 0 && <p className="text-slate-500">No active proposals at the moment.</p>}
      </div>
    </div>
  );
};

export default ProposalGrid;