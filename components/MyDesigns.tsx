import React from 'react';
import { Design } from '../types';
import Card from './shared/Card';
import LoadingSkeleton from './shared/LoadingSkeleton';

interface MyDesignsProps {
  items: Design[];
  loading: boolean;
}

const DesignCard: React.FC<{ item: Design, style?: React.CSSProperties }> = ({ item, style }) => (
  <div className="border rounded-lg p-2 bg-slate-50/50 shadow-inner animate-fade-in-up" style={style}>
    <img src={item.imageUrl} alt={item.prompt} className="rounded w-full aspect-square object-cover" />
    <p className="text-xs text-slate-600 mt-1 truncate" title={item.prompt}>{item.prompt}</p>
  </div>
);

const MyDesigns: React.FC<MyDesignsProps> = ({ items, loading }) => {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">🧪 My Designs</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading && Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
                <LoadingSkeleton className="w-full aspect-square rounded-lg"/>
                <LoadingSkeleton className="h-3 w-full rounded"/>
            </div>
        ))}
        {!loading && items.map((design, i) => <DesignCard key={design.id} item={design} style={{ animationDelay: `${i * 75}ms`}} />)}
        {!loading && items.length === 0 && <p className="text-slate-500 col-span-full">Your generated designs will appear here.</p>}
      </div>
    </Card>
  );
};

export default MyDesigns;