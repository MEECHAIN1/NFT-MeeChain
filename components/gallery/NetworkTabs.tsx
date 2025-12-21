import React from 'react';

interface NetworkTabsProps {
    selected: 'testnet' | 'mainnet';
    onSelect: (network: 'testnet' | 'mainnet') => void;
}

const tabsConfig = [
    { 
        key: 'testnet' as const, 
        label: 'Testnet Achievements',
        emoji: '🧪',
        badge: 'Sandbox Soul',
        badgeClass: 'bg-green-100 text-green-800 ring-green-500/20',
        tooltip: 'Explore and create MeeBots without using real funds.'
    },
    { 
        key: 'mainnet' as const, 
        label: 'Mainnet MeeBots',
        emoji: '🌐',
        badge: 'Real Soul',
        badgeClass: 'bg-blue-100 text-blue-800 ring-blue-500/20',
        tooltip: 'Your genuinely owned MeeBots on the main network.'
    },
];


export const NetworkTabs: React.FC<NetworkTabsProps> = ({ selected, onSelect }) => {
  return (
    <div className="flex border-b border-slate-200/80 mb-6">
      {tabsConfig.map((tab) => (
        <button
          key={tab.key}
          title={tab.tooltip}
          className={`flex items-center gap-2 px-4 py-2 -mb-px font-semibold transition-colors duration-200 focus:outline-none ${
            selected === tab.key
              ? 'text-purple-600 border-b-2 border-purple-500'
              : 'text-slate-500 border-b-2 border-transparent hover:text-purple-600'
          }`}
          onClick={() => onSelect(tab.key)}
        >
          {tab.emoji}
          <span>{tab.label}</span>
          <span className={`hidden sm:inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${tab.badgeClass}`}>
            {tab.badge}
          </span>
        </button>
      ))}
    </div>
  );
};

export default NetworkTabs;