import React, { useState, useMemo, useEffect, useRef } from 'react';
// Update import to the new dataService and rename functions
import { getAccount, logBadge, logTimelineEvent, logVote, addXP, triggerEvolution, logMint, XP_VALUES } from '../services/dataService';
import { useUserNFTs } from '../hooks/useUserNFTs';
import { useUserBadges } from '../hooks/useUserBadges';
import { useProposals } from '../hooks/useProposals';
import { useContributorEvents } from '../hooks/useContributorEvents';
import { useUserDesigns } from '../hooks/useUserDesigns';
import { useContributorProfile } from '../hooks/useContributorProfile';
import { useVoiceLogs } from '../hooks/useVoiceLogs';
import { useMintMeeBot, useVoteOnProposal, useClaimBadge } from '../services/contractService';
import { generateSpeech } from '../services/geminiService';
import { getAudioContext, playBase64Audio } from '../utils/audioUtils';

import HallOfOrigins from './MyCollection';
import MyDesigns from './MyDesigns';
import BadgeGallery from './BadgeGallery';
import ProposalGrid from './ProposalGrid';
import ContributorTimeline from './ContributorTimeline';
import MeeBotWidget from './MeeBotWidget';
import Notification from './shared/Notification';
import MeeBotGenesis from './MeeBotGenesis';
import ContributorStats from './shared/ContributorStats';
import MeeBotCertificateModal from './EvolutionHistoryModal';
import GalleryPage from './gallery/GalleryPage';
import Chatbot from './Chatbot';
import { TimelineEventType, NFT, Badge } from '../types';

export default function LandingPage() {
  const { address } = getAccount();
  
  const [notification, setNotification] = useState<string | null>(null);
  const [meeBotMessage, setMeeBotMessage] = useState("Welcome back, contributor! Ready to build the future with MeeChain?");
  const [votingOnProposalId, setVotingOnProposalId] = useState<string | null>(null);
  const [evolvingNftId, setEvolvingNftId] = useState<string | null>(null);
  const [newlyMintedNftId, setNewlyMintedNftId] = useState<string | null>(null);
  const [viewingCertificateForNft, setViewingCertificateForNft] = useState<NFT | null>(null);

  // Refs for context-aware sections
  const collectionRef = useRef<HTMLDivElement>(null);
  const designsRef = useRef<HTMLDivElement>(null);
  const proposalsRef = useRef<HTMLDivElement>(null);


  const { nfts, loading: nftsLoading } = useUserNFTs(address);
  const { badges, loading: badgesLoading } = useUserBadges(address);
  const { proposals, loading: proposalsLoading } = useProposals();
  const { events: timeline, loading: timelineLoading } = useContributorEvents(address);
  const { designs, loading: designsLoading } = useUserDesigns(address);
  const { profile, loading: profileLoading } = useContributorProfile(address);
  const { voiceLogs, loading: voiceLogsLoading } = useVoiceLogs(address);

    // Proactive MeeBot Logic using Intersection Observer
    useEffect(() => {
        const observerOptions = {
            root: null, // observe intersections in the viewport
            threshold: 0.6, // 60% of the element must be visible
        };

        const callback = (entries: IntersectionObserverEntry[]) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    let newMessage = '';
                    if (entry.target === collectionRef.current) {
                        newMessage = "This is your Hall of Origins, where every MeeBot's journey begins. Shall we mint a new companion?";
                    } else if (entry.target === designsRef.current) {
                        newMessage = "I see you've been creative! These are your designs. We can bring any of them to life as an NFT.";
                    } else if (entry.target === proposalsRef.current) {
                        newMessage = "Analyzing proposals? I can summarize the key points for you with Gemini. Just let me know!";
                    }

                    if (newMessage) {
                        setMeeBotMessage(current => (current !== newMessage ? newMessage : current));
                    }
                }
            });
        };

        const observer = new IntersectionObserver(callback, observerOptions);
        
        const refs = [collectionRef, designsRef, proposalsRef];
        refs.forEach(ref => {
            if (ref.current) {
                observer.observe(ref.current);
            }
        });

        return () => {
            refs.forEach(ref => {
                if (ref.current) {
                    observer.unobserve(ref.current);
                }
            });
        };
    // Re-run observer setup if loading states change, ensuring refs are attached to rendered elements
    }, [nftsLoading, designsLoading, proposalsLoading]);

  const handleActionSuccess = async (message: string, meeBotMsg: string, xpToAdd: number = 0) => {
    if (xpToAdd > 0) {
      const { leveledUp, newLevel } = await addXP(xpToAdd);
      setNotification(`${message} (+${xpToAdd} XP)`);

      if (leveledUp) {
        // Evolve the most recently minted NFT (which is the first in the array)
        const botToEvolve = nfts[0];
        if (botToEvolve) {
          const evolvedBot = await triggerEvolution(botToEvolve.id, `Reached Level ${newLevel}!`);
          if (evolvedBot) {
            // Use a timeout to ensure the level-up message isn't instantly overwritten
            setTimeout(() => {
              setMeeBotMessage(`Level up to ${newLevel}! Your ${evolvedBot.name} felt that power and has evolved!`);
              setEvolvingNftId(evolvedBot.id);
              setNotification(`You reached Level ${newLevel}! Your MeeBot evolved!`);
            }, 500);
          }
        }
      } else {
        setMeeBotMessage(meeBotMsg);
      }
    } else {
      setMeeBotMessage(meeBotMsg);
      setNotification(message);
    }
  };

  const { write: mintNFT, isLoading: isMinting } = useMintMeeBot({
    onSuccess: async () => {
      const nftNumber = Math.floor(Math.random() * 9000) + 1000;
      
      const firstWordsText = `Greetings, creator! I am MeeBot #${nftNumber}. It is an honor to be born.`;
      const firstWordsAudio = await generateSpeech(firstWordsText);

      const newNftData: Omit<NFT, 'id'> = {
        name: `MeeBot #${nftNumber}`,
        imageUrl: `https://picsum.photos/seed/meebot${nftNumber}/500`,
        rarity: 'Rare',
        description: 'A freshly minted MeeBot, ready for adventure in the ecosystem.',
        txHash: `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        firstWords: firstWordsAudio || undefined,
      };

      const newNft = await logMint(newNftData);
      const mintedName = newNft.name; // Use the name from the returned object for consistency

      setNewlyMintedNftId(newNft.id); // Trigger celebration animation
      setViewingCertificateForNft(newNft); // Open the birth certificate modal

      await logTimelineEvent({
        type: TimelineEventType.Mint,
        title: `${mintedName} was born!`,
        description: `A new ${newNft.rarity} companion has joined the collective.`,
        imageUrl: newNft.imageUrl,
        txHash: newNft.txHash,
        nftId: newNft.id,
      });

      await handleActionSuccess('NFT Minted Successfully!', `A new companion is born! Welcome, ${mintedName}!`, XP_VALUES.MINT_RANDOM);
    },
  });

  const { write: claimBadge, isLoading: isClaiming } = useClaimBadge({
    onSuccess: async () => {
        const newBadgeData: Omit<Badge, 'id'> = {
            name: 'Active Contributor',
            imageUrl: 'https://picsum.photos/seed/badge4/300',
            description: 'For interacting with the dashboard features.'
        };
        const newBadge = await logBadge(newBadgeData);
        await logTimelineEvent({
            type: TimelineEventType.Badge,
            title: 'Earned "Active Contributor" Badge',
            description: 'You are making MeeChain better every day.',
            badgeName: newBadge.name,
            imageUrl: newBadge.imageUrl,
        });
        await handleActionSuccess('Badge Claimed!', 'Woohoo! You just earned the "Active Contributor" badge. Well done!', XP_VALUES.CLAIM_BADGE);
        
        // --- Trigger Evolution on Genesis bot specifically for this badge claim ---
        const genesisBot = nfts.find(n => n.id === 'nft1');
        if (genesisBot) {
            const evolvedBot = await triggerEvolution(genesisBot.id, 'Claimed "Active Contributor" Badge');
            if (evolvedBot) {
                setMeeBotMessage(`Wow! Your ${evolvedBot.name} felt that surge of energy and has evolved!`);
                setEvolvingNftId(evolvedBot.id);
            }
        }
    }
  });

    // Clear the evolving state after animation
    useEffect(() => {
        if (evolvingNftId) {
            const timer = setTimeout(() => setEvolvingNftId(null), 2100); // Animation duration is 2s
            return () => clearTimeout(timer);
        }
    }, [evolvingNftId]);
    
    // Clear the newly minted state after animation
    useEffect(() => {
        if (newlyMintedNftId) {
            const timer = setTimeout(() => setNewlyMintedNftId(null), 1600); // Animation is 1.5s
            return () => clearTimeout(timer);
        }
    }, [newlyMintedNftId]);


  const { write: voteOnProposal, isLoading: isVoting } = useVoteOnProposal({
    onSuccess: async (proposalId, support) => {
        if (!proposalId) return;
        await logVote(proposalId, support as boolean);
        await logTimelineEvent({
            type: TimelineEventType.Proposal,
            title: `Voted on Proposal`,
            description: `Voted ${support ? 'FOR' : 'AGAINST'} on a crucial governance matter.`
        });
        await handleActionSuccess('Vote Cast Successfully!', 'Your voice has been heard! Thank you for participating in governance.', XP_VALUES.VOTE);
        setVotingOnProposalId(null);
    }
  });

  const handleVote = (proposalId: string, support: boolean) => {
    setVotingOnProposalId(proposalId);
    voteOnProposal(proposalId, support);
  };
  
  const canClaimNewBadge = useMemo(() => !badges.some(b => b.name === 'Active Contributor'), [badges]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-sky-50 to-blue-100 p-4 sm:p-6 lg:p-8 animate-gradient-bg">
      <Notification message={notification} onClose={() => setNotification(null)} />
      <MeeBotCertificateModal nft={viewingCertificateForNft} onClose={() => setViewingCertificateForNft(null)} />

      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 animate-fade-in-up">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-600">MeeChain</span> Dashboard
            </h1>
             <p className="text-sm font-mono text-slate-500 mt-1 truncate">{address}</p>
          </div>
          <ContributorStats profile={profile} loading={profileLoading} />
        </header>

        <div className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <MeeBotWidget key={meeBotMessage} mood="joyful" message={meeBotMessage} />
        </div>
        
        <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <MeeBotGenesis onActionSuccess={handleActionSuccess} onMintSuccess={(nft) => {
              setNewlyMintedNftId(nft.id);
              setViewingCertificateForNft(nft);
          }} />
        </div>

        <main>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2 flex flex-col gap-8">
              <section ref={collectionRef} className="animate-fade-in-up" style={{ animationDelay: '450ms' }}>
                <HallOfOrigins items={nfts} loading={nftsLoading} onMint={mintNFT} isMinting={isMinting} evolvingNftId={evolvingNftId} newlyMintedNftId={newlyMintedNftId} onShowHistory={setViewingCertificateForNft} />
              </section>
              <section ref={designsRef} className="animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                <MyDesigns items={designs} loading={designsLoading} />
              </section>
            </div>
            
            <div className="flex flex-col gap-8">
              <section className="animate-fade-in-up" style={{ animationDelay: '550ms' }}>
                <BadgeGallery items={badges} loading={badgesLoading} onClaim={claimBadge} isClaiming={isClaiming} canClaim={canClaimNewBadge}/>
              </section>
              <section ref={proposalsRef} className="animate-fade-in-up" style={{ animationDelay: '700ms' }}>
                <ProposalGrid items={proposals} loading={proposalsLoading} onVote={handleVote} votingOnProposalId={isVoting ? votingOnProposalId : null} />
              </section>
            </div>
          </div>

          <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '800ms' }}>
            <ContributorTimeline events={timeline} loading={timelineLoading} nfts={nfts} onViewCertificate={setViewingCertificateForNft} />
          </div>

          <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '950ms' }}>
            <GalleryPage 
              meebots={nfts}
              meebotsLoading={nftsLoading}
              voiceLogs={voiceLogs}
              voiceLogsLoading={voiceLogsLoading}
            />
          </div>
        </main>
      </div>
      <Chatbot />
    </div>
  );
}