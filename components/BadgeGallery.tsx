import React from 'react';
import { Badge } from '../types';
import Card from './shared/Card';
import LoadingSkeleton from './shared/LoadingSkeleton';

interface BadgeGalleryProps {
  items: Badge[];
  loading: boolean;
  onClaim: () => void;
  isClaiming: boolean;
  canClaim: boolean;
}

// FIX: Add className to props and apply it to the Card component.
const BadgeCard: React.FC<{ item: Badge, style?: React.CSSProperties, className?: string }> = ({ item, style, className }) => (
  <Card className={`flex items-center p-4 gap-4 ${className || ''}`} style={style}>
    <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-full object-cover shadow-md border-2 border-white" />
    <div>
      <h3 className="font-bold text-md text-slate-900">{item.name}</h3>
      <p className="text-slate-600 text-sm">{item.description}</p>
    </div>
  </Card>
);

const BadgeGallery: React.FC<BadgeGalleryProps> = ({ items, loading, onClaim, isClaiming, canClaim }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-slate-800">My Badges</h2>
      <div className="space-y-4">
        {loading && Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="flex items-center p-4 gap-4">
            <LoadingSkeleton className="w-16 h-16 rounded-full" />
            <div className="flex-1">
              <LoadingSkeleton className="h-5 w-2/4 mb-2" />
              <LoadingSkeleton className="h-4 w-full" />
            </div>
          </Card>
        ))}
        {!loading && items.map((item, i) => 
            <BadgeCard 
              key={item.id} 
              item={item} 
              style={{ animationDelay: `${i * 100}ms`}}
              className="animate-fade-in-up"
            />
        )}
        {!loading && items.length === 0 && <p className="text-slate-500">No badges yet. Keep up the great work!</p>}
      </div>
       {!loading && canClaim && (
          <button
            onClick={() => onClaim()}
            disabled={isClaiming}
            className="w-full mt-4 flex items-center justify-center px-4 py-2 bg-sky-500 text-white font-semibold rounded-lg shadow-md hover:bg-sky-600 transition-colors duration-300 disabled:bg-sky-300 disabled:cursor-not-allowed animate-fade-in-up"
             style={{ animationDelay: `${items.length * 100}ms`}}
          >
            {isClaiming ? (
              <>
                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                Claiming...
              </>
            ) : (
              "🏆 Claim Contributor Badge"
            )}
          </button>
        )}
    </div>
  );
};

export default BadgeGallery;