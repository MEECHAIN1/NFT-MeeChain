import React from 'react';
import { ContributorProfile } from '../../types';
import Card from './Card';
import LoadingSkeleton from './LoadingSkeleton';

interface ContributorStatsProps {
  profile: ContributorProfile | null;
  loading: boolean;
}

const ContributorStats: React.FC<ContributorStatsProps> = ({ profile, loading }) => {
  if (loading || !profile) {
    return (
        <div className="w-64 h-20 p-3 bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/50">
            <LoadingSkeleton className="h-5 w-1/4 mb-2" />
            <LoadingSkeleton className="h-4 w-full" />
        </div>
    );
  }

  return (
    <Card className="p-3 w-64 shrink-0">
      <div className="flex justify-between items-baseline mb-1">
        <span className="font-bold text-lg text-slate-800">Level {profile.level}</span>
        <span className="text-xs font-semibold text-slate-500">{(profile.levelXp ?? 0).toLocaleString()} / {(profile.nextLevelXp ?? 0).toLocaleString()} XP</span>
      </div>
      <div className="w-full bg-slate-200/80 rounded-full h-2.5">
          <div 
            className="bg-gradient-to-r from-sky-400 to-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${profile.progress}%` }}
          ></div>
      </div>
    </Card>
  );
};

export default ContributorStats;