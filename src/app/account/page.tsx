'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckIcon,
  ClockIcon,
  CreditCardIcon,
  QrCodeIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, StarIcon } from '@heroicons/react/24/solid';
import { useTelegramWebApp } from '@/lib/telegram';
import { paymentService } from '@/lib/api';
import { formatDate, copyToClipboard } from '@/lib/utils';
import { SUBSCRIPTION_PLANS, SUPPORTED_CURRENCIES } from '@/config';
import AppLayout from '@/components/layout/AppLayout';
import type { Subscription, Payment } from '@/types';

interface PaymentStep {
  id: string;
  title: string;
  completed: boolean;
  active: boolean;
}

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<'subscription' | 'payment'>('subscription');
  const [selectedPlan, setSelectedPlan] = useState<'1-month' | '12-month'>('1-month');
  const [selectedCurrency, setSelectedCurrency] = useState<'USDT' | 'BTC'>('USDT');
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<Payment | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentSteps, setPaymentSteps] = useState<PaymentStep[]>([
    { id: 'create', title: 'Create Payment', completed: false, active: true },
    { id: 'confirm', title: 'Send Payment', completed: false, active: false },
    { id: 'verify', title: 'Verify Transaction', completed: false, active: false },
    { id: 'complete', title: 'Activate Subscription', completed: false, active: false },
  ]);

  const { user, webApp } = useTelegramWebApp();

  useEffect(() => {
    loadUserSubscription();
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (paymentData && paymentData.status === 'pending') {
      interval = setInterval(checkPaymentStatus, 10000); // Check every 10 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [paymentData]);

  const loadUserSubscription = async () => {
    // In a real app, fetch from API using user.id
    const mockSubscription: Subscription = {
      id: 'sub_1',
      user_id: user?.id || 0,
      plan: '1-month',
      status: 'expired',
      payment_method: 'USDT',
      amount: 9.99,
      currency: 'USDT',
      created_at: '2024-01-01T00:00:00Z',
      expires_at: '2024-01-31T23:59:59Z',
      auto_renew: false,
    };
    
    // Only set if user has an active subscription
    if (mockSubscription.status === 'active' && new Date(mockSubscription.expires_at) > new Date()) {
      setSubscription(mockSubscription);
    }
  };

  const createPayment = async () => {
    try {
      setLoading(true);
      webApp?.HapticFeedback.impactOccurred('medium');

      const plan = SUBSCRIPTION_PLANS[selectedPlan];
      const payment = await paymentService.createPayment(
        plan.price_usd,
        selectedCurrency,
        `subscription_${Date.now()}`
      );

      setPaymentData(payment);
      setActiveTab('payment');
      updatePaymentStep('create', true);
      updatePaymentStep('confirm', false, true);

      webApp?.HapticFeedback.notificationOccurred('success');
    } catch (error) {
      console.error('Failed to create payment:', error);
      webApp?.HapticFeedback.notificationOccurred('error');
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!paymentData) return;

    try {
      const status = await paymentService.getPaymentStatus(paymentData.id);
      
      if (status.status === 'completed') {
        setPaymentData(prev => prev ? { ...prev, status: 'completed' } : null);
        updatePaymentStep('verify', true);
        updatePaymentStep('complete', true);
        
        // Create subscription
        const newSubscription: Subscription = {
          id: `sub_${Date.now()}`,
          user_id: user?.id || 0,
          plan: selectedPlan,
          status: 'active',
          payment_method: selectedCurrency,
          amount: SUBSCRIPTION_PLANS[selectedPlan].price_usd,
          currency: selectedCurrency,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + SUBSCRIPTION_PLANS[selectedPlan].duration * 24 * 60 * 60 * 1000).toISOString(),
          auto_renew: false,
        };
        
        setSubscription(newSubscription);
        webApp?.HapticFeedback.notificationOccurred('success');
      } else if (status.status === 'confirming') {
        updatePaymentStep('confirm', true);
        updatePaymentStep('verify', false, true);
      }
    } catch (error) {
      console.error('Failed to check payment status:', error);
    }
  };

  const updatePaymentStep = (stepId: string, completed: boolean, active = false) => {
    setPaymentSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, completed, active }
        : step.id === prev.find(s => s.id === stepId)?.id 
          ? { ...step, active: false }
          : step
    ));
  };

  const copyPaymentAddress = async () => {
    if (!paymentData?.payment_address) return;
    
    try {
      await copyToClipboard(paymentData.payment_address);
      webApp?.HapticFeedback.notificationOccurred('success');
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  const renderSubscriptionTab = () => (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      {subscription ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6"
        >
          <div className="flex items-center">
            <StarIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">
                Premium Active
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300">
                Your {SUBSCRIPTION_PLANS[subscription.plan].name} subscription expires on {formatDate(subscription.expires_at)}
              </p>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Free Plan
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Upgrade to premium to unlock advanced features and trading signals.
          </p>
        </motion.div>
      )}

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(SUBSCRIPTION_PLANS).map(([planKey, plan]) => (
          <motion.div
            key={planKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`relative border-2 rounded-lg p-6 cursor-pointer transition-all ${
              selectedPlan === planKey
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 dark:border-blue-400'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => {
              setSelectedPlan(planKey as any);
              webApp?.HapticFeedback.selectionChanged();
            }}
          >
            {planKey === '12-month' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  SAVE {plan.discount}%
                </span>
              </div>
            )}

            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {plan.name}
              </h3>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                ${plan.price_usd}
                <span className="text-lg text-gray-500 dark:text-gray-400 font-normal">
                  /{planKey === '1-month' ? 'month' : 'year'}
                </span>
              </div>

              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {selectedPlan === planKey && (
                <CheckCircleIcon className="h-6 w-6 text-blue-500 mx-auto" />
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Payment Currency Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Select Payment Method
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(SUPPORTED_CURRENCIES).map(([currency, info]) => (
            <button
              key={currency}
              onClick={() => {
                setSelectedCurrency(currency as any);
                webApp?.HapticFeedback.selectionChanged();
              }}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                selectedCurrency === currency
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {info.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {info.symbol} • Min: ${info.min_amount}
                  </div>
                </div>
                {selectedCurrency === currency && (
                  <CheckCircleIcon className="h-5 w-5 text-blue-500" />
                )}
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Subscribe Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <button
          onClick={createPayment}
          disabled={loading}
          className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating Payment...
            </>
          ) : (
            <>
              <CreditCardIcon className="h-5 w-5 mr-2" />
              Subscribe to {SUBSCRIPTION_PLANS[selectedPlan].name}
            </>
          )}
        </button>
      </motion.div>
    </div>
  );

  const renderPaymentTab = () => {
    if (!paymentData) {
      return (
        <div className="text-center py-12">
          <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No active payment found.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Payment Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Payment Progress
          </h3>
          
          <div className="space-y-4">
            {paymentSteps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  step.completed 
                    ? 'bg-green-500 text-white' 
                    : step.active 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                }`}>
                  {step.completed ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="ml-4">
                  <div className={`text-sm font-medium ${
                    step.completed || step.active 
                      ? 'text-gray-900 dark:text-white' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {step.title}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Payment Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Send Payment
          </h3>
          
          <div className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
              <div className="flex items-center">
                <ClockIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                <span className="text-sm text-yellow-800 dark:text-yellow-200">
                  Payment expires in {Math.floor((new Date(paymentData.expires_at).getTime() - Date.now()) / (1000 * 60))} minutes
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount to Send
                </label>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {paymentData.amount} {paymentData.currency}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Address
                </label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded border">
                    {paymentData.payment_address}
                  </code>
                  <button
                    onClick={copyPaymentAddress}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <DocumentDuplicateIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="text-center">
              <div className="inline-block p-4 bg-white rounded-lg">
                <QrCodeIcon className="h-32 w-32 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Scan QR code with your wallet
              </p>
            </div>

            {/* Payment Status */}
            <div className="text-center">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                paymentData.status === 'completed' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : paymentData.status === 'confirming'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}>
                {paymentData.status === 'completed' && <CheckIcon className="h-4 w-4 mr-1" />}
                {paymentData.status === 'confirming' && <ClockIcon className="h-4 w-4 mr-1" />}
                Status: {paymentData.status.charAt(0).toUpperCase() + paymentData.status.slice(1)}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {user ? `Welcome, ${user.first_name}!` : 'Account'}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your subscription and account settings
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex justify-center space-x-8">
            {[
              { id: 'subscription', label: 'Subscription' },
              { id: 'payment', label: 'Payment' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'subscription' && renderSubscriptionTab()}
          {activeTab === 'payment' && renderPaymentTab()}
        </div>
      </div>
    </AppLayout>
  );
}
