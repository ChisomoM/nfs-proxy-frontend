/**
 * Usage & Charges Tab
 * Displays pay-as-you-go charges that accrue as the system is used
 * No subscription plans - charges are usage-based
 */

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, BarChart3, Clock, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/api/merchantProfileMocks';
import type { UsageMetrics } from '@/lib/api/merchantProfileAPI.types';

interface UsageTabProps {
  usage: UsageMetrics;
}

const UsageTab: React.FC<UsageTabProps> = ({ usage }) => {
  // Calculate usage percentage
  const usagePercentage = (usage.currentMonthUsage.paymentVolume / 100000000) * 100;

  // Container animation
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Info Banner - Pay as You Go */}
      <motion.div variants={itemVariants} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900">Pay-as-You-Go Billing</h3>
            <p className="text-xs text-blue-800 mt-1">
              Charges accrue based on your system usage. No fixed plans or subscriptions. You'll be billed monthly for all transactions processed.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Total Charges Card */}
      <motion.div variants={itemVariants}>
        <Card className="border-gradient bg-gradient-to-br from-white to-gray-50 card-glow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Charges (All-Time)</p>
                <p className="font-display font-bold text-display-md text-gradient-stat mt-2 tabular-nums">
                  {formatCurrency(usage.totalChargesAccrued)}
                </p>
                {usage.lastChargeDate && (
                  <p className="text-xs text-gray-500 mt-2">
                    Last charge: {formatDate(usage.lastChargeDate)}
                  </p>
                )}
              </div>
              <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Current Period Charges */}
      <motion.div variants={itemVariants}>
        <Card className="border-gradient">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-gp-sky" />
              Current Billing Period
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-lg border border-blue-100">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Month Charges</p>
                <p className="font-display font-bold text-display-md text-gp-sky-600 mt-2 tabular-nums">
                  {formatCurrency(usage.currentMonthCharges)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-lg border border-purple-100">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Avg Per Transaction</p>
                <p className="font-display font-bold text-display-md text-purple-600 mt-2 tabular-nums">
                  {formatCurrency(usage.avgTransactionAmount)}
                </p>
              </div>
            </div>

            {/* Period Info */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">Current period: April 1 - 30, 2026</p>
              {usage.nextBillingDate && (
                <p className="text-xs text-gray-500">
                  Next billing: {new Date(usage.nextBillingDate).toLocaleDateString('en-ZM')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Usage Details */}
      <motion.div variants={itemVariants}>
        <Card className="border-gradient">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-gray-600" />
              Usage Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Transaction Count */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-900">Total Transactions</p>
                <p className="font-semibold text-gray-900">{usage.currentMonthUsage.transactionCount.toLocaleString()}</p>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-gp-sky to-gp-cobalt"
                  initial={{ width: 0 }}
                  animate={{ width: '75%' }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">This billing period</p>
            </div>

            {/* Payment Volume */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-900">Total Payment Volume</p>
                <p className="font-mono font-semibold text-gray-900 tabular-nums">
                  {formatCurrency(usage.currentMonthUsage.paymentVolume)}
                </p>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-400 to-green-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500">
                  {((usagePercentage).toFixed(1))}% of typical limit
                </p>
                <p className="text-xs text-gray-500">~ZMW 100M typical</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Billing Schedule */}
      <motion.div variants={itemVariants}>
        <Card className="border-gradient bg-gradient-to-br from-gray-50 to-white">
          <CardHeader>
            <CardTitle className="text-lg">Billing Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gp-sky-100 flex items-center justify-center">
                  <span className="text-xs font-semibold text-gp-sky-700">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Billing Period Opens</p>
                  <p className="text-xs text-gray-500">1st of each month</p>
                </div>
              </div>
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gp-sky-100 flex items-center justify-center">
                  <span className="text-xs font-semibold text-gp-sky-700">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Usage Tracked</p>
                  <p className="text-xs text-gray-500">All charges accrue throughout the month</p>
                </div>
              </div>
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gp-sky-100 flex items-center justify-center">
                  <span className="text-xs font-semibold text-gp-sky-700">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Invoice Generated</p>
                  <p className="text-xs text-gray-500">On the last day of billing period</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gp-sky-100 flex items-center justify-center">
                  <span className="text-xs font-semibold text-gp-sky-700">4</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Payment Due</p>
                  <p className="text-xs text-gray-500">Typically within 7-14 days of invoice date</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* FAQ Card */}
      <motion.div variants={itemVariants}>
        <Card className="border-gradient bg-gradient-to-br from-amber-50 to-white">
          <CardHeader>
            <CardTitle className="text-lg">Questions?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              For detailed billing information, invoices, or to discuss your charges:
            </p>
            <button className="text-gp-sky font-medium hover:underline text-sm">
              Contact Billing Support →
            </button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default UsageTab;
