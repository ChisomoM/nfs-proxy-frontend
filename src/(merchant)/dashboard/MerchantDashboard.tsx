import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import {
  ArrowUpRight,
  ArrowDownRight,
  Send,
  Eye,
  Settings,
  Download,
  TrendingUp,
} from 'lucide-react';
import { PageTransition } from '@/components/shared/PageTransition';
import { PageHeader } from '@/components/shared/PageHeader';
import { MetricCard } from '@/components/shared/MetricCard';
import { SectionCard } from '@/components/shared/SectionCard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Mock Data for Charts
const transactionVolumeData = [
  { day: 'Mon', volume: 2400, api_calls: 1200 },
  { day: 'Tue', volume: 1398, api_calls: 2210 },
  { day: 'Wed', volume: 9800, api_calls: 2222 },
  { day: 'Thu', volume: 3908, api_calls: 2000 },
  { day: 'Fri', volume: 4800, api_calls: 2181 },
  { day: 'Sat', volume: 3800, api_calls: 2500 },
  { day: 'Sun', volume: 4300, api_calls: 2100 },
];

const disbursementData = [
  { name: 'Successful', value: 68, fill: '#383d92' },
  { name: 'Failed', value: 12, fill: '#00afeb' },
  { name: 'Pending', value: 20, fill: '#0089B8' },
];

const apiUsageData = [
  { time: '00:00', requests: 120 },
  { time: '04:00', requests: 190 },
  { time: '08:00', requests: 340 },
  { time: '12:00', requests: 450 },
  { time: '16:00', requests: 380 },
  { time: '20:00', requests: 290 },
  { time: '23:59', requests: 150 },
];

const recentTransactions = [
  {
    id: 'TXN-20260524-001',
    merchant: 'Mobile Money Transfer',
    amount: 45000,
    status: 'completed',
    type: 'disbursement',
    time: '2 mins ago',
  },
  {
    id: 'TXN-20260524-002',
    merchant: 'Bank Transfer',
    amount: 120000,
    status: 'processing',
    type: 'fund_transfer',
    time: '15 mins ago',
  },
  {
    id: 'TXN-20260524-003',
    merchant: 'API Query',
    amount: 1500,
    status: 'completed',
    type: 'api_call',
    time: '32 mins ago',
  },
  {
    id: 'TXN-20260524-004',
    merchant: 'Fund Settlement',
    amount: 250000,
    status: 'failed',
    type: 'settlement',
    time: '1 hour ago',
  },
  {
    id: 'TXN-20260524-005',
    merchant: 'Mobile Money Transfer',
    amount: 78000,
    status: 'completed',
    type: 'disbursement',
    time: '3 hours ago',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export const MerchantDashboard: React.FC = () => {
  const [dateRange] = useState('7d');

  // Calculate aggregated metrics
  const metrics = useMemo(() => {
    const totalTransactions = recentTransactions.length;
    const totalAmount = recentTransactions.reduce((sum, t) => sum + t.amount, 0);
    const successfulDisbursements = recentTransactions.filter(
      (t) => t.status === 'completed' && t.type === 'disbursement'
    ).length;
    const failedDisbursements = recentTransactions.filter(
      (t) => t.status === 'failed'
    ).length;
    const apiCalls = transactionVolumeData.reduce((sum, d) => sum + d.api_calls, 0);

    return {
      totalTransactions,
      totalAmount,
      successfulDisbursements,
      failedDisbursements,
      apiCalls,
      successRate:
        ((successfulDisbursements / (successfulDisbursements + failedDisbursements)) * 100)
          .toFixed(1),
    };
  }, []);

  return (
    <PageTransition className="space-y-8 pb-12">
      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        subtitle="Monitor your transactions, API usage, and disbursement performance in real-time"
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download size={16} />
              Export
            </Button>
          </div>
        }
      />

      {/* Top Metrics Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <MetricCard
            label="Total Transactions"
            value={metrics.totalTransactions.toString()}
            variant="info"
            icon={<TrendingUp size={20} />}
            trend={{
              value: '+12%',
              isUp: true,
            }}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <MetricCard
            label="Total Volume"
            value={`ZMW ${(metrics.totalAmount / 1000).toFixed(0)}K`}
            subtitle="Last 7 days"
            variant="success"
            trend={{
              value: '+8.2%',
              isUp: true,
            }}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <MetricCard
            label="Successful"
            value={metrics.successfulDisbursements.toString()}
            subtitle="Disbursements"
            variant="success"
            trend={{
              value: metrics.successRate + '%',
              isUp: true,
            }}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <MetricCard
            label="Failed"
            value={metrics.failedDisbursements.toString()}
            subtitle="Disbursements"
            variant="danger"
            trend={{
              value: '-2.1%',
              isUp: false,
            }}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <MetricCard
            label="API Usage"
            value={metrics.apiCalls.toString()}
            subtitle="Requests (7d)"
            variant="default"
            trend={{
              value: '+24%',
              isUp: true,
            }}
          />
        </motion.div>
      </motion.div>

      {/* Charts Section */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Transaction Volume Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <SectionCard
            title="Transaction Volume & API Calls"
            subtitle="Daily breakdown for the last 7 days"
          >
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={transactionVolumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGradientVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#383d92" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#383d92" stopOpacity={0.65} />
                    </linearGradient>
                    <linearGradient id="barGradientAPI" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00afeb" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#00afeb" stopOpacity={0.65} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF0F5" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="volume" fill="url(#barGradientVolume)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="api_calls" fill="url(#barGradientAPI)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </motion.div>

        {/* Disbursement Status Ring Chart */}
        <motion.div variants={itemVariants}>
          <SectionCard title="Disbursement Status" subtitle="Distribution">
            <div className="h-80 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={disbursementData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {disbursementData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
              {disbursementData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="text-sm font-medium text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </motion.div>
      </motion.div>

      {/* API Usage Timeline Chart */}
      <motion.div variants={itemVariants}>
        <SectionCard
          title="API Usage Timeline"
          subtitle="Requests by hour today"
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={apiUsageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00afeb" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#00afeb" stopOpacity={0.08} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF0F5" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="requests"
                  stroke="#00afeb"
                  dot={false}
                  strokeWidth={2}
                  fill="url(#lineGradient)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </motion.div>

      {/* Recent Transactions Table */}
      <motion.div variants={itemVariants}>
        <SectionCard
          title="Recent Transactions"
          subtitle="Latest activity from your account"
          action={
            <Button variant="ghost" size="sm" className="text-gp-cobalt">
              View All
            </Button>
          }
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[140px]">Transaction ID</TableHead>
                  <TableHead className="min-w-[160px]">Merchant</TableHead>
                  <TableHead className="min-w-[100px] text-right">Amount</TableHead>
                  <TableHead className="min-w-[100px]">Type</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[100px]">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((transaction) => (
                  <TableRow
                    key={transaction.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="font-mono text-sm text-gray-600">
                      {transaction.id}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-gray-900">
                      {transaction.merchant}
                    </TableCell>
                    <TableCell className="text-right font-medium text-gray-900 tabular-nums">
                      ZMW {transaction.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 capitalize">
                      {transaction.type.replace(/_/g, ' ')}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={transaction.status as any}
                        label={transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      />
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {transaction.time}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionCard>
      </motion.div>

      {/* Quick Actions Section */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-6 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 hover:border-gp-cobalt/20 transition-all group">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gp-cobalt/10 rounded-lg group-hover:bg-gp-cobalt/20 transition-colors">
                <Send size={20} className="text-gp-cobalt" />
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-gp-cobalt transition-colors">
                New Disbursement
              </h3>
            </div>
            <p className="text-sm text-gray-500">Create a new disbursement</p>
          </button>

          <button className="p-6 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 hover:border-gp-sky/20 transition-all group">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gp-sky/10 rounded-lg group-hover:bg-gp-sky/20 transition-colors">
                <Eye size={20} className="text-gp-sky" />
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-gp-sky transition-colors">
                View API Keys
              </h3>
            </div>
            <p className="text-sm text-gray-500">Manage your API credentials</p>
          </button>

          <button className="p-6 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 hover:border-success/20 transition-all group">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-success/10 rounded-lg group-hover:bg-success/20 transition-colors">
                <Download size={20} className="text-success" />
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-success transition-colors">
                Export Data
              </h3>
            </div>
            <p className="text-sm text-gray-500">Download reports</p>
          </button>

          <button className="p-6 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 hover:border-warning/20 transition-all group">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-warning/10 rounded-lg group-hover:bg-warning/20 transition-colors">
                <Settings size={20} className="text-warning" />
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-warning transition-colors">
                Settings
              </h3>
            </div>
            <p className="text-sm text-gray-500">Configure your account</p>
          </button>
        </div>
      </motion.div>
    </PageTransition>
  );
};
