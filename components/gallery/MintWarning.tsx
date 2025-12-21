import React from 'react';

interface MintWarningProps {
    network: 'testnet' | 'mainnet';
}

export const MintWarning: React.FC<MintWarningProps> = ({ network }) => {
  const isMainnet = network === 'mainnet';
  return isMainnet ? (
    <div className="bg-amber-100/60 border border-amber-300/50 text-amber-800 text-sm rounded-lg p-4 mb-6">
      <p className="mb-1 font-semibold">⚠️ Minting on mainnet uses real ETH and incurs gas fees.</p>
      <p>The minting feature is currently disabled on mainnet for safety. Please switch to testnet to explore and create new MeeBots freely.</p>
    </div>
  ) : null;
};

export default MintWarning;
