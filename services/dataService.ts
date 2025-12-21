import { NFT, Badge, Proposal, TimelineEvent, Design, ContributorProfile, EvolutionStage, VoiceLog, TimelineEventType } from '../types';
import { db } from './firebase';
import { 
    collection, 
    doc, 
    addDoc, 
    updateDoc, 
    serverTimestamp, 
    runTransaction, 
    onSnapshot,
    query,
    orderBy,
    limit,
    where
} from 'firebase/firestore';

export const XP_VALUES = {
    MINT_RANDOM: 50,
    MINT_DESIGNED: 100,
    CLAIM_BADGE: 75,
    VOTE: 25,
    GENERATE_DESIGN: 10,
};

const XP_PER_LEVEL = 250;

// This can be replaced with a real wallet connection service like wagmi or ethers
export const getAccount = () => ({
  address: '0x1234567890AbCdEf1234567890aBcDeF12345678',
});

// Helper function to calculate profile stats based on XP
const calculateProfile = (xp: number): ContributorProfile => {
    const level = Math.floor(xp / XP_PER_LEVEL) + 1;
    const xpInCurrentLevel = xp % XP_PER_LEVEL;
    const nextLevelXp = level * XP_PER_LEVEL;
    const levelXp = (level - 1) * XP_PER_LEVEL;
    const progress = (xpInCurrentLevel / XP_PER_LEVEL) * 100;
    return { xp, level, levelXp, nextLevelXp, progress };
};


// --- REAL-TIME LISTENERS ---

export const listenToUserNFTs = (wallet: string, onData: (data: NFT[]) => void) => {
    const q = query(collection(db, `users/${wallet}/nfts`), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as NFT[];
        onData(data);
    }, (error) => {
        console.error("Firestore error [NFTs]:", error.message);
        onData([]);
    });
};

export const listenToUserBadges = (wallet: string, onData: (data: Badge[]) => void) => {
    const q = query(collection(db, `users/${wallet}/badges`), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Badge[];
        onData(data);
    }, (error) => {
        console.error("Firestore error [Badges]:", error.message);
        onData([]);
    });
};

export const listenToProposals = (onData: (data: Proposal[]) => void) => {
    const q = query(collection(db, 'proposals'));
    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Proposal[];
        onData(data);
    }, (error) => {
        console.error("Firestore error [Proposals]:", error.message);
        onData([]);
    });
};

export const listenToContributorEvents = (wallet: string, onData: (data: TimelineEvent[]) => void) => {
    const q = query(collection(db, `users/${wallet}/timeline`), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TimelineEvent[];
        onData(data);
    }, (error) => {
        console.error("Firestore error [Timeline]:", error.message);
        onData([]);
    });
};

export const listenToUserDesigns = (wallet: string, onData: (data: Design[]) => void) => {
    const q = query(collection(db, `users/${wallet}/designs`), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Design[];
        onData(data);
    }, (error) => {
        console.error("Firestore error [Designs]:", error.message);
        onData([]);
    });
};

export const listenToContributorProfile = (wallet: string, onData: (data: ContributorProfile | null) => void) => {
    const profileRef = doc(db, `users/${wallet}/profile`, 'summary');
    return onSnapshot(profileRef, (doc) => {
        if (doc.exists()) {
            onData(doc.data() as ContributorProfile);
        } else {
            onData(null);
        }
    }, (error) => {
        console.error("Firestore error [Profile]:", error.message);
        onData(null);
    });
};

export const listenToVoiceLogs = (wallet: string, onData: (data: VoiceLog[]) => void) => {
    const q = query(collection(db, `users/${wallet}/voicelogs`), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as VoiceLog[];
        onData(data);
    }, (error) => {
        console.error("Firestore error [VoiceLogs]:", error.message);
        onData([]);
    });
};


// --- WRITE FUNCTIONS TO FIRESTORE ---

export const addXP = async (amount: number): Promise<{ leveledUp: boolean; newLevel: number }> => {
    const wallet = getAccount().address;
    const profileRef = doc(db, `users/${wallet}/profile`, 'summary');

    try {
        let leveledUp = false;
        let newLevel = 1;

        await runTransaction(db, async (transaction) => {
            const profileDoc = await transaction.get(profileRef);
            
            let currentXp = 0;
            if (profileDoc.exists()) {
                currentXp = profileDoc.data().xp || 0;
            }
            
            const oldLevel = calculateProfile(currentXp).level;
            const newXp = currentXp + amount;
            const newProfileData = calculateProfile(newXp);
            
            transaction.set(profileRef, newProfileData, { merge: true });

            leveledUp = newProfileData.level > oldLevel;
            newLevel = newProfileData.level;
        });

        return { leveledUp, newLevel };
    } catch (e) {
        console.error("Transaction failed: ", e);
        return { leveledUp: false, newLevel: 1 };
    }
};

export const logMint = async (newNftData: Omit<NFT, 'id'>): Promise<NFT> => {
    const wallet = getAccount().address;
    const evolutionStage: EvolutionStage = {
        stage: 1,
        name: `Birth of ${newNftData.name}`,
        imageUrl: newNftData.imageUrl,
        description: newNftData.description,
        timestamp: new Date().toISOString(),
        triggerEvent: 'Minted'
    };
    const dataToSave = {
        ...newNftData,
        network: 'testnet',
        evolutionStages: [evolutionStage],
        createdAt: serverTimestamp()
    };
    const docRef = await addDoc(collection(db, `users/${wallet}/nfts`), dataToSave);
    return { id: docRef.id, ...newNftData, evolutionStages: [evolutionStage] };
};

export const logBadge = async (newBadgeData: Omit<Badge, 'id'>): Promise<Badge> => {
    const wallet = getAccount().address;
    const dataToSave = { ...newBadgeData, createdAt: serverTimestamp() };
    const docRef = await addDoc(collection(db, `users/${wallet}/badges`), dataToSave);
    return { id: docRef.id, ...newBadgeData };
};

export const logVote = async (proposalId: string, support: boolean): Promise<void> => {
    const proposalRef = doc(db, 'proposals', proposalId);
    await runTransaction(db, async (transaction) => {
        const proposalDoc = await transaction.get(proposalRef);
        if (!proposalDoc.exists()) {
            throw "Document does not exist!";
        }
        const currentVotesFor = proposalDoc.data().votesFor || 0;
        const currentVotesAgainst = proposalDoc.data().votesAgainst || 0;
        const newVotes = support 
            ? { votesFor: currentVotesFor + 1 } 
            : { votesAgainst: currentVotesAgainst + 1 };
        transaction.update(proposalRef, newVotes);
    });
};

export const logTimelineEvent = async (eventData: Omit<TimelineEvent, 'id' | 'timestamp'>): Promise<TimelineEvent> => {
    const wallet = getAccount().address;
    const newEvent: Omit<TimelineEvent, 'id'> = {
        ...eventData,
        timestamp: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, `users/${wallet}/timeline`), newEvent);
    return { id: docRef.id, ...newEvent };
};

export const logDesign = async (designData: Omit<Design, 'id'>): Promise<Design> => {
    const wallet = getAccount().address;
    const docRef = await addDoc(collection(db, `users/${wallet}/designs`), designData);
    return { id: docRef.id, ...designData };
};

export const updateDesignStatus = async (designId: string, status: 'minted' | 'generated'): Promise<void> => {
    const wallet = getAccount().address;
    const designRef = doc(db, `users/${wallet}/designs`, designId);
    await updateDoc(designRef, { status });
};

export const logVoiceLog = async (logData: Omit<VoiceLog, 'id'>): Promise<VoiceLog> => {
    const wallet = getAccount().address;
    const docRef = await addDoc(collection(db, `users/${wallet}/voicelogs`), logData);
    return { id: docRef.id, ...logData };
};

export const triggerEvolution = async (nftId: string, triggerEvent: string): Promise<NFT | null> => {
    const wallet = getAccount().address;
    const nftRef = doc(db, `users/${wallet}/nfts`, nftId);
    let evolvedNft: NFT | null = null;

    try {
        await runTransaction(db, async (transaction) => {
            const nftDoc = await transaction.get(nftRef);
            if (!nftDoc.exists()) {
                throw "NFT not found!";
            }
            const nft = { id: nftDoc.id, ...nftDoc.data() } as NFT;
            
            const currentStageNum = nft.evolutionStages?.length || 0;
            const newStageNum = currentStageNum + 1;

            const evolutions = [
                { name: 'Crystal Awakening', description: 'Gained wisdom in governance.', seed: 's2' },
                { name: 'Cosmic Insight', description: 'Radiates with cosmic energy.', seed: 's3' },
                { name: 'Starlight Sentinel', description: 'Became a guardian of the network.', seed: 's4' },
                { name: 'Nebula Weaver', description: 'Learned to shape the very fabric of the chain.', seed: 's5' },
            ];
            
            const evolutionData = evolutions[newStageNum - 2] || evolutions[evolutions.length - 1];
            
            const newStage: EvolutionStage = {
                stage: newStageNum,
                name: evolutionData.name,
                imageUrl: `https://picsum.photos/seed/${nft.id}-${evolutionData.seed}/500`,
                description: `Triggered by "${triggerEvent}", the MeeBot now ${evolutionData.description.toLowerCase()}`,
                timestamp: new Date().toISOString(),
                triggerEvent: triggerEvent,
            };

            const updatedStages = [...(nft.evolutionStages || []), newStage];
            const updatedData = {
                imageUrl: newStage.imageUrl,
                evolutionStages: updatedStages,
            };
            
            transaction.update(nftRef, updatedData);

            evolvedNft = { ...nft, ...updatedData };
        });

        if (evolvedNft) {
            const latestStage = (evolvedNft as NFT).evolutionStages?.slice(-1)[0];
            await logTimelineEvent({
                type: TimelineEventType.Evolution,
                title: 'MeeBot Evolved!',
                description: `${(evolvedNft as NFT).name} reached Stage ${latestStage?.stage}: ${latestStage?.name}!`,
                imageUrl: (evolvedNft as NFT).imageUrl,
                nftId: (evolvedNft as NFT).id,
            });
        }
    } catch (e) {
        console.error("Evolution failed: ", e);
    }

    return evolvedNft;
};