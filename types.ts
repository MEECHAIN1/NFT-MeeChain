export interface EvolutionStage {
  stage: number;
  name: string;
  imageUrl: string;
  description: string;
  timestamp: string;
  triggerEvent: string;
}

export interface NFT {
  id: string;
  name: string;
  imageUrl: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  description: string;
  txHash?: string;
  evolutionStages?: EvolutionStage[];
  firstWords?: string; // Base64 encoded audio data
  network?: 'testnet' | 'mainnet';
}

export interface Badge {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
}

export enum ProposalStatus {
  Active = 'Active',
  Passed = 'Passed',
  Failed = 'Failed',
  Pending = 'Pending'
}

export interface Proposal {
  id:string;
  title: string;
  status: ProposalStatus;
  summary: string;
  votesFor: number;
  votesAgainst: number;
}

export enum TimelineEventType {
    Commit = 'Commit',
    Proposal = 'Proposal',
    Badge = 'Badge',
    Merge = 'Merge',
    Design = 'Design',
    Mint = 'Mint',
    MoodAnalysis = 'MoodAnalysis',
    Evolution = 'Evolution',
}

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description: string;
  timestamp: string;
  // Optional fields for richer journey display
  imageUrl?: string;
  txHash?: string;
  mood?: 'joyful' | 'curious' | 'helpful' | 'celebratory';
  context?: string;
  badgeName?: string;
  nftId?: string;
}

export interface Design {
    id: string;
    prompt: string;
    imageUrl: string;
    status: 'generated' | 'minted';
    timestamp: string;
}

export interface ContributorProfile {
    xp: number;
    level: number;
    levelXp: number;
    nextLevelXp: number;
    progress: number;
}

export interface VoiceLog {
  id: string;
  timestamp: string;
  mood: 'joyful' | 'curious' | 'helpful' | 'celebratory' | 'thoughtful';
  quote: string;
  network: 'testnet' | 'mainnet';
  meebotId?: string; // Link to the MeeBot that inspired this log
}