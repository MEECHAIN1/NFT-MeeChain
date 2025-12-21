import { 
    logMockMint, 
    logMockTimelineEvent, 
    logMockVoiceLog
} from '../services/mockData';
import { TimelineEventType, NFT, VoiceLog } from '../types';

interface PreparedMetadata {
  name: string;
  description: string;
  image: string;
  attributes: { trait_type: string; value: string }[];
}

export const finalizeMeeBotBirth = async (preparedMetadata: PreparedMetadata, originalPrompt: string): Promise<NFT> => {
    // This is the logic from the onSuccess callback
    const newNftData: Omit<NFT, 'id'> = {
        name: preparedMetadata.name,
        imageUrl: preparedMetadata.image,
        rarity: 'Epic', // Custom mints are Epic rarity
        description: preparedMetadata.description,
        txHash: `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`
    };
    
    const newNft = await logMockMint(newNftData);
    
    const mood = preparedMetadata.attributes.find(attr => attr.trait_type === 'Mood')?.value;

    await logMockTimelineEvent({
        type: TimelineEventType.Mint,
        title: `A ${mood || 'new'} MeeBot was Born!`,
        description: `From prompt: "${originalPrompt.substring(0, 40)}..."`,
        imageUrl: newNft.imageUrl,
        txHash: newNft.txHash,
        nftId: newNft.id,
    });

    if (mood) {
        await logMockVoiceLog({
            mood: mood as VoiceLog['mood'],
            quote: originalPrompt,
            timestamp: new Date().toISOString(),
            meebotId: newNft.id,
            network: 'testnet',
        });
    }

    return newNft;
};
