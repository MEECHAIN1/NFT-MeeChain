import { NFT, Badge, Proposal, TimelineEvent, ProposalStatus, TimelineEventType, Design, ContributorProfile, EvolutionStage, VoiceLog } from '../types';

// --- Simple Pub/Sub System to Simulate Realtime Listeners ---
type Collection = 'nfts' | 'badges' | 'proposals' | 'timeline' | 'designs' | 'profile' | 'voicelogs';
type ListenerCallback<T> = (data: T) => void;

const listeners: { [key in Collection]: ListenerCallback<any>[] } = {
  nfts: [],
  badges: [],
  proposals: [],
  timeline: [],
  designs: [],
  profile: [],
  voicelogs: [],
};

const subscribe = <T>(collection: Collection, callback: ListenerCallback<T>): (() => void) => {
  listeners[collection].push(callback);
  return () => { // Unsubscribe function
    listeners[collection] = listeners[collection].filter(cb => cb !== callback);
  };
};

const emit = <T>(collection: Collection, data: T) => {
  listeners[collection].forEach(callback => callback(data));
};

// --- XP System ---
let mockUserXP = 120; // Starting XP
const XP_PER_LEVEL = 250;
export const XP_VALUES = {
    MINT_RANDOM: 50,
    MINT_DESIGNED: 100,
    CLAIM_BADGE: 75,
    VOTE: 25,
    GENERATE_DESIGN: 10,
};

// Make mock data mutable to simulate a database
let mockNFTs: NFT[] = [
  { 
    id: 'nft1', 
    name: 'Genesis Contributor', 
    imageUrl: 'https://picsum.photos/seed/nft1-s2/500', 
    rarity: 'Legendary', 
    description: 'Awarded to the first 100 contributors to the MeeChain protocol.', 
    txHash: '0xabc...def',
    network: 'testnet',
    evolutionStages: [
      {
        stage: 1,
        name: 'Birth of Genesis',
        imageUrl: 'https://picsum.photos/seed/nft1-s1/500',
        description: 'The first spark of contribution, bringing the Genesis MeeBot to life.',
        timestamp: new Date('2023-08-10T10:00:00Z').toISOString(),
        triggerEvent: 'Initial Contribution'
      },
      {
        stage: 2,
        name: 'Crystal Awakening',
        imageUrl: 'https://picsum.photos/seed/nft1-s2/500',
        description: 'After earning the "First Proposal" badge, a shimmering crystal appeared, signifying its growing wisdom in governance.',
        timestamp: new Date('2023-09-01T11:05:00Z').toISOString(),
        triggerEvent: 'Earned "First Proposal" Badge'
      }
    ]
  },
  { id: 'nft2', name: 'MeeBot #1337', imageUrl: 'https://picsum.photos/seed/meebot1337/500', rarity: 'Rare', description: 'A freshly minted MeeBot, ready for adventure.', txHash: '0x123...456', network: 'testnet' },
];

let mockBadges: Badge[] = [
  { id: 'badge1', name: 'First Proposal', imageUrl: 'https://picsum.photos/seed/badge1/300', description: 'For creating your first governance proposal.' },
  { id: 'badge2', name: 'Code Contributor', imageUrl: 'https://picsum.photos/seed/badge2/300', description: 'For merging your first pull request.' },
  { id: 'badge3', name: 'Bug Squasher', imageUrl: 'https://picsum.photos/seed/badge3/300', description: 'For successfully closing a bug-related issue.' },
];

let mockProposals: Proposal[] = [
  { id: 'prop1', title: 'Q3 Protocol Upgrade', status: ProposalStatus.Active, summary: 'Proposal to implement the latest ZK-rollup technology for enhanced privacy and scalability.', votesFor: 1250, votesAgainst: 150 },
  { id: 'prop2', title: 'Community Grant for Dev Tools', status: ProposalStatus.Passed, summary: 'A grant to fund the development of open-source tools for MeeChain builders.', votesFor: 2800, votesAgainst: 50 },
  { id: 'prop3', title: 'Adjust Validator Rewards', status: ProposalStatus.Failed, summary: 'A proposal to decrease validator rewards to fund a new treasury initiative.', votesFor: 400, votesAgainst: 1100 },
];

let mockTimelineEvents: TimelineEvent[] = [
  {
    id: 't1',
    type: TimelineEventType.Mint,
    title: 'Minted Genesis Contributor NFT',
    description: 'Your very first MeeBot companion was born!',
    timestamp: new Date('2023-08-10T10:00:00Z').toISOString(),
    imageUrl: 'https://picsum.photos/seed/nft1-s1/500',
    txHash: '0xabc...def',
    nftId: 'nft1',
  },
  {
    id: 't2',
    type: TimelineEventType.Commit,
    title: 'First Commit to MeeChain Core',
    description: 'Pushed commit `feat: add initial UI components` to the main repository.',
    timestamp: new Date('2023-08-15T14:30:00Z').toISOString(),
  },
  {
    id: 't3',
    type: TimelineEventType.Badge,
    title: 'Earned "Code Contributor" Badge',
    description: 'Your first pull request was successfully merged.',
    timestamp: new Date('2023-08-16T09:00:00Z').toISOString(),
    badgeName: 'Code Contributor',
  },
  {
    id: 't-evolution1',
    type: TimelineEventType.Evolution,
    title: 'MeeBot Evolved!',
    description: 'Genesis Contributor reached Stage 2: Crystal Awakening, gaining new wisdom.',
    timestamp: new Date('2023-09-01T11:05:00Z').toISOString(),
    imageUrl: 'https://picsum.photos/seed/nft1-s2/500',
    nftId: 'nft1', // FIX: Added nftId to link the event to the NFT
  },
  {
    id: 't4',
    type: TimelineEventType.MoodAnalysis,
    title: 'MeeBot Mood Analysis',
    description: 'Your recent flurry of activity around governance shows a strong sense of leadership.',
    mood: 'joyful',
    context: 'Active participation in proposal voting.',
    timestamp: new Date('2023-09-05T18:00:00Z').toISOString(),
  },
];

let mockDesigns: Design[] = [
    { id: 'd1', prompt: 'a happy MeeBot floating in a sea of stars', imageUrl: 'https://picsum.photos/seed/design1/512', status: 'minted', timestamp: new Date('2023-08-20T11:00:00Z').toISOString() },
    { id: 'd2', prompt: 'a wise MeeBot reading an ancient book', imageUrl: 'https://picsum.photos/seed/design2/512', status: 'generated', timestamp: new Date('2023-08-22T15:20:00Z').toISOString() },
];

let mockVoiceLogs: VoiceLog[] = [
    {
        id: 'vl1',
        timestamp: new Date('2023-09-10T10:00:00Z').toISOString(),
        mood: 'thoughtful',
        quote: 'Every line of code is a step towards a more decentralized future.',
        network: 'testnet',
    },
    {
        id: 'vl2',
        timestamp: new Date('2023-09-12T15:30:00Z').toISOString(),
        mood: 'joyful',
        quote: 'Collaboration is the spark that ignites innovation!',
        network: 'testnet',
    },
    {
        id: 'vl3',
        timestamp: new Date('2023-09-15T09:00:00Z').toISOString(),
        mood: 'curious',
        quote: 'What new wonders will we build together today?',
        network: 'mainnet',
    }
];


// --- "DATABASE" FUNCTIONS ---

// Function to calculate profile stats based on XP
const calculateProfile = (xp: number): ContributorProfile => {
    const level = Math.floor(xp / XP_PER_LEVEL) + 1;
    const xpInCurrentLevel = xp % XP_PER_LEVEL;
    const nextLevelXp = level * XP_PER_LEVEL;
    const levelXp = (level - 1) * XP_PER_LEVEL;
    const progress = (xpInCurrentLevel / XP_PER_LEVEL) * 100;

    return {
        xp,
        level,
        levelXp,
        nextLevelXp,
        progress,
    };
};

let mockProfile: ContributorProfile = calculateProfile(mockUserXP);

// Simulate real-time listeners for data changes
export const listenToMockUserNFTs = (wallet: string, onData: (data: NFT[]) => void) => {
    onData(mockNFTs); // Initial data
    return subscribe<NFT[]>('nfts', onData);
};
export const listenToMockUserBadges = (wallet: string, onData: (data: Badge[]) => void) => {
    onData(mockBadges); // Initial data
    return subscribe<Badge[]>('badges', onData);
};
export const listenToMockProposals = (onData: (data: Proposal[]) => void) => {
    onData(mockProposals); // Initial data
    return subscribe<Proposal[]>('proposals', onData);
};
export const listenToMockContributorEvents = (wallet: string, onData: (data: TimelineEvent[]) => void) => {
    // Sort events before sending them
    const sortedEvents = mockTimelineEvents.slice().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    onData(sortedEvents); // Initial data
    return subscribe<TimelineEvent[]>('timeline', (updatedEvents) => {
         const sorted = updatedEvents.slice().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
         onData(sorted);
    });
};
export const listenToMockUserDesigns = (wallet: string, onData: (data: Design[]) => void) => {
    onData(mockDesigns); // Initial data
    return subscribe<Design[]>('designs', onData);
};
export const listenToMockContributorProfile = (wallet: string, onData: (data: ContributorProfile) => void) => {
    onData(mockProfile); // Initial data
    return subscribe<ContributorProfile>('profile', onData);
};
export const listenToMockVoiceLogs = (wallet: string, onData: (data: VoiceLog[]) => void) => {
    onData(mockVoiceLogs);
    return subscribe<VoiceLog[]>('voicelogs', onData);
};


// --- "WRITE" FUNCTIONS TO SIMULATE DB UPDATES ---

export const getMockAccount = () => ({
  address: '0x1234567890AbCdEf1234567890aBcDeF12345678',
});

// Helper function to add XP and update the profile
export const addMockXP = (amount: number): Promise<{ leveledUp: boolean; newLevel: number }> => {
    const oldLevel = mockProfile.level;
    mockUserXP += amount;
    mockProfile = calculateProfile(mockUserXP);
    const newLevel = mockProfile.level;

    emit('profile', mockProfile);
    
    // Return whether a level up occurred and the new level
    return Promise.resolve({ leveledUp: newLevel > oldLevel, newLevel });
};


export const logMockMint = (newNftData: Omit<NFT, 'id'>) => {
  const newId = `nft${mockNFTs.length + 1}`;
  const newNft: NFT = { 
    id: newId, 
    ...newNftData,
    network: 'testnet', // All new mints are on testnet for now
    evolutionStages: [{
      stage: 1,
      name: `Birth of ${newNftData.name}`,
      imageUrl: newNftData.imageUrl,
      description: newNftData.description,
      timestamp: new Date().toISOString(),
      triggerEvent: 'Minted'
    }]
  };
  mockNFTs = [newNft, ...mockNFTs];
  emit('nfts', mockNFTs);
  return Promise.resolve(newNft);
};

export const logMockBadge = (newBadgeData: Omit<Badge, 'id'>) => {
    const newId = `badge${mockBadges.length + 1}`;
    const newBadge = { id: newId, ...newBadgeData };
    mockBadges = [newBadge, ...mockBadges];
    emit('badges', mockBadges);
    return Promise.resolve(newBadge);
};

export const logMockVote = (proposalId: string, support: boolean) => {
    mockProposals = mockProposals.map(p => {
        if (p.id === proposalId) {
            return {
                ...p,
                votesFor: support ? p.votesFor + 1 : p.votesFor,
                votesAgainst: !support ? p.votesAgainst + 1 : p.votesAgainst,
            };
        }
        return p;
    });
    emit('proposals', mockProposals);
    return Promise.resolve();
};

export const logMockTimelineEvent = (eventData: Omit<TimelineEvent, 'id' | 'timestamp'>) => {
  const newEvent: TimelineEvent = {
    id: `t${mockTimelineEvents.length + 1}`,
    timestamp: new Date().toISOString(),
    ...eventData,
  };
  mockTimelineEvents = [newEvent, ...mockTimelineEvents];
  emit('timeline', mockTimelineEvents);
  return Promise.resolve(newEvent);
};

export const logMockDesign = (designData: Omit<Design, 'id'>) => {
    const newDesign: Design = {
        id: `d${mockDesigns.length + 1}`,
        ...designData
    };
    mockDesigns = [newDesign, ...mockDesigns];
    emit('designs', mockDesigns);
    return Promise.resolve(newDesign);
}

export const updateMockDesignStatus = (designId: string, status: 'minted' | 'generated') => {
    mockDesigns = mockDesigns.map(design => {
        if (design.id === designId) {
            return { ...design, status };
        }
        return design;
    });
    emit('designs', mockDesigns);
    return Promise.resolve();
};

export const logMockVoiceLog = (logData: Omit<VoiceLog, 'id'>): Promise<VoiceLog> => {
    const newLog: VoiceLog = {
        id: `vl${mockVoiceLogs.length + 1}`,
        ...logData,
    };
    mockVoiceLogs = [newLog, ...mockVoiceLogs];
    emit('voicelogs', mockVoiceLogs);
    return Promise.resolve(newLog);
};

// --- EVOLUTION SYSTEM ---
export const triggerMockEvolution = async (nftId: string, triggerEvent: string): Promise<NFT | null> => {
    let evolvedNft: NFT | null = null;
    mockNFTs = mockNFTs.map(nft => {
        if (nft.id === nftId) {
            const currentStageNum = nft.evolutionStages?.length || 0;
            const newStageNum = currentStageNum + 1;

            // Define some possible evolutions
            const evolutions = [
                // Stage 2 (index 0)
                { name: 'Crystal Awakening', description: 'Gained wisdom in governance.', seed: 's2' },
                // Stage 3 (index 1)
                { name: 'Cosmic Insight', description: 'Radiates with cosmic energy.', seed: 's3' },
                // Stage 4 (index 2)
                { name: 'Starlight Sentinel', description: 'Became a guardian of the network.', seed: 's4' },
                // Stage 5 (index 3) and beyond
                { name: 'Nebula Weaver', description: 'Learned to shape the very fabric of the chain.', seed: 's5' },
            ];
            
            // Pick an evolution based on the stage, loop if needed
            const evolutionData = evolutions[newStageNum - 2] || evolutions[evolutions.length - 1];
            
            const newStage: EvolutionStage = {
                stage: newStageNum,
                name: evolutionData.name,
                imageUrl: `https://picsum.photos/seed/${nft.id}-${evolutionData.seed}/500`,
                description: `Triggered by "${triggerEvent}", the MeeBot now ${evolutionData.description.toLowerCase()}`,
                timestamp: new Date().toISOString(),
                triggerEvent: triggerEvent,
            };

            const updatedNft = {
                ...nft,
                imageUrl: newStage.imageUrl, // Update main image to latest evolution
                evolutionStages: [...(nft.evolutionStages || []), newStage],
            };
            evolvedNft = updatedNft;
            return updatedNft;
        }
        return nft;
    });

    if (evolvedNft) {
        emit('nfts', mockNFTs);
        const latestStage = evolvedNft.evolutionStages?.slice(-1)[0];
        await logMockTimelineEvent({
            type: TimelineEventType.Evolution,
            title: 'MeeBot Evolved!',
            description: `${evolvedNft.name} reached Stage ${latestStage?.stage}: ${latestStage?.name}!`,
            imageUrl: evolvedNft.imageUrl,
            nftId: evolvedNft.id,
        });
    }

    return Promise.resolve(evolvedNft);
};