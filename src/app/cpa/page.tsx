'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  GiftIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowTopRightOnSquareIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  UsersIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useTelegramWebApp } from '@/lib/telegram';
import { formatTimeAgo, copyToClipboard } from '@/lib/utils';
import AppLayout from '@/components/layout/AppLayout';
import type { CPACampaign } from '@/types';

interface UserProgress {
  campaign_id: string;
  status: 'pending' | 'completed' | 'verified' | 'rewarded';
  completed_at?: string;
  reward_claimed?: boolean;
}

// Mock CPA campaigns data
const mockCampaigns: CPACampaign[] = [
  {
    id: 'cpa_1',
    title: 'Download Binance App',
    description: 'Download and create an account on Binance exchange. Complete KYC verification to earn premium access.',
    reward_type: 'premium_days',
    reward_amount: 7,
    requirements: {
      action: 'Download app and complete registration + KYC',
      url: 'https://www.binance.com/en/register',
      verification_method: 'postback',
    },
    status: 'active',
    max_participants: 1000,
    current_participants: 743,
    created_at: '2024-08-01T00:00:00Z',
    expires_at: '2024-08-31T23:59:59Z',
  },
  {
    id: 'cpa_2',
    title: 'Install MetaMask Wallet',
    description: 'Install MetaMask browser extension or mobile app and create your first wallet.',
    reward_type: 'premium_days',
    reward_amount: 3,
    requirements: {
      action: 'Install MetaMask and create wallet',
      url: 'https://metamask.io/download/',
      verification_method: 'manual',
    },
    status: 'active',
    max_participants: 500,
    current_participants: 234,
    created_at: '2024-08-01T00:00:00Z',
    expires_at: '2024-08-15T23:59:59Z',
  },
  {
    id: 'cpa_3',
    title: 'Join CoinMarketCap',
    description: 'Create an account on CoinMarketCap and add 5 coins to your watchlist.',
    reward_type: 'premium_days',
    reward_amount: 2,
    requirements: {
      action: 'Register and create watchlist',
      url: 'https://coinmarketcap.com/account/signup/',
      verification_method: 'manual',
    },
    status: 'active',
    max_participants: 2000,
    current_participants: 1456,
    created_at: '2024-07-15T00:00:00Z',
    expires_at: '2024-08-30T23:59:59Z',
  },
  {
    id: 'cpa_4',
    title: 'Follow on Twitter',
    description: 'Follow our official Twitter account and retweet our latest announcement.',
    reward_type: 'premium_days',
    reward_amount: 1,
    requirements: {
      action: 'Follow and retweet',
      url: 'https://twitter.com/cryptoquiver',
      verification_method: 'manual',
    },
    status: 'active',
    max_participants: 5000,
    current_participants: 3241,
    created_at: '2024-08-01T00:00:00Z',
    expires_at: '2024-12-31T23:59:59Z',
  },
];

// Mock user progress data
const mockUserProgress: UserProgress[] = [
  {
    campaign_id: 'cpa_3',
    status: 'completed',
    completed_at: '2024-08-01T15:30:00Z',
    reward_claimed: true,
  },
  {
    campaign_id: 'cpa_2',
    status: 'pending',
  },
];

export default function CPAPage() {
  const [campaigns, setCampaigns] = useState<CPACampaign[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalEarned, setTotalEarned] = useState(0);

  const { user, webApp } = useTelegramWebApp();

  useEffect(() => {
    loadCampaigns();
    loadUserProgress();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      // In a real app, fetch from API
      setTimeout(() => {
        setCampaigns(mockCampaigns);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
      setLoading(false);
    }
  };

  const loadUserProgress = async () => {
    try {
      // In a real app, fetch user's progress from API
      setUserProgress(mockUserProgress);
      
      // Calculate total earned days
      const earned = mockUserProgress
        .filter(progress => progress.status === 'completed' && progress.reward_claimed)
        .reduce((total, progress) => {
          const campaign = mockCampaigns.find(c => c.id === progress.campaign_id);
          return total + (campaign?.reward_amount || 0);
        }, 0);
      
      setTotalEarned(earned);
    } catch (error) {
      console.error('Failed to load user progress:', error);
    }
  };

  const getUserProgressForCampaign = (campaignId: string): UserProgress | undefined => {
    return userProgress.find(progress => progress.campaign_id === campaignId);
  };

  const handleStartCampaign = async (campaign: CPACampaign) => {
    try {
      webApp?.HapticFeedback.impactOccurred('medium');
      
      // Open the campaign URL
      webApp?.openLink?.(campaign.requirements.url, { try_instant_view: false });
      
      // Mark as started in user progress
      const existingProgress = getUserProgressForCampaign(campaign.id);
      if (!existingProgress) {
        const newProgress: UserProgress = {
          campaign_id: campaign.id,
          status: 'pending',
        };
        setUserProgress(prev => [...prev, newProgress]);
      }
    } catch (error) {
      console.error('Failed to start campaign:', error);
      webApp?.HapticFeedback.notificationOccurred('error');
    }
  };

  const handleClaimReward = async (campaign: CPACampaign) => {
    try {
      webApp?.HapticFeedback.impactOccurred('heavy');
      
      // In a real app, verify completion and claim reward via API
      const progressIndex = userProgress.findIndex(p => p.campaign_id === campaign.id);
      if (progressIndex !== -1) {
        const updatedProgress = [...userProgress];
        updatedProgress[progressIndex] = {
          ...updatedProgress[progressIndex],
          status: 'rewarded',
          reward_claimed: true,
          completed_at: new Date().toISOString(),
        };
        setUserProgress(updatedProgress);
        setTotalEarned(prev => prev + campaign.reward_amount);
        
        webApp?.HapticFeedback.notificationOccurred('success');
        
        // Show success message
        webApp?.showPopup?.({
          title: 'Reward Claimed!',
          message: `You've earned ${campaign.reward_amount} days of premium access!`,
          buttons: [{ type: 'ok', text: 'Awesome!' }],
        });
      }
    } catch (error) {
      console.error('Failed to claim reward:', error);
      webApp?.HapticFeedback.notificationOccurred('error');
    }
  };

  const copyReferralLink = async (campaign: CPACampaign) => {
    const referralLink = `${campaign.requirements.url}?ref=${user?.id}`;
    try {
      await copyToClipboard(referralLink);
      webApp?.HapticFeedback.notificationOccurred('success');
    } catch (error) {
      console.error('Failed to copy referral link:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'rewarded':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'rewarded':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'pending':
        return <ClockIcon className="h-4 w-4" />;
      default:
        return <GiftIcon className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 w-full max-w-none">
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4"
          >
            <SparklesIcon className="h-8 w-8 text-white" />
          </motion.div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Earn Premium Access
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Complete simple tasks to earn free premium subscription days
          </p>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">{totalEarned}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Days Earned</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {userProgress.filter(p => p.status === 'completed' || p.status === 'rewarded').length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Tasks Completed</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">{campaigns.length}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Available Tasks</div>
          </div>
        </motion.div>

        {/* How it Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 rounded-lg p-4 w-full overflow-hidden"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            How it Works
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold text-sm">1</span>
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">Choose Task</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Select a campaign that interests you
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold text-sm">2</span>
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">Complete Action</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Follow the instructions and complete the task
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold text-sm">3</span>
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">Get Verified</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Wait for verification of your completion
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold text-sm">4</span>
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">Claim Reward</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Enjoy your free premium access
              </p>
            </div>
          </div>
        </motion.div>

        {/* Campaigns List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Available Campaigns
          </h2>
          
          {campaigns.map((campaign, index) => {
            const progress = getUserProgressForCampaign(campaign.id);
            const isCompleted = progress?.status === 'completed' || progress?.status === 'rewarded';
            const isPending = progress?.status === 'pending';
            const canClaim = progress?.status === 'completed' && !progress?.reward_claimed;
            
            return (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow w-full overflow-hidden"
              >
                <div className="flex flex-col space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <GiftIcon className="h-5 w-5 text-white" />
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                          {campaign.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span className="flex items-center">
                            <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                            {campaign.reward_amount} days
                          </span>
                          <span className="flex items-center">
                            <UsersIcon className="h-3 w-3 mr-1" />
                            {campaign.current_participants}/{campaign.max_participants}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {progress && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(progress.status)}`}>
                        {getStatusIcon(progress.status)}
                        <span className="ml-1 capitalize">{progress.status}</span>
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {campaign.description}
                  </p>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="text-xs">
                      <div className="font-medium text-gray-900 dark:text-white mb-1">
                        Requirements:
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {campaign.requirements.action}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{campaign.current_participants}/{campaign.max_participants}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all"
                        style={{
                          width: `${(campaign.current_participants / campaign.max_participants) * 100}%`
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    {!progress && (
                      <button
                        onClick={() => handleStartCampaign(campaign)}
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all w-full"
                      >
                        Start Task
                        <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-2" />
                      </button>
                    )}

                    {isPending && (
                      <button
                        onClick={() => handleStartCampaign(campaign)}
                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full"
                      >
                        Continue Task
                        <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-2" />
                      </button>
                    )}

                    {canClaim && (
                      <button
                        onClick={() => handleClaimReward(campaign)}
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors w-full"
                      >
                        Claim Reward
                        <GiftIcon className="h-4 w-4 ml-2" />
                      </button>
                    )}

                    {isCompleted && progress?.reward_claimed && (
                      <div className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-green-700 dark:text-green-300 w-full">
                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                        Completed
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {campaigns.length === 0 && (
          <div className="text-center py-12">
            <GiftIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No campaigns available
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Check back later for new earning opportunities.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
