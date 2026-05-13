import React from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Building2,
  AlertCircle,
  Wallet,
  CheckCircle2,
  Clock,
  Users,
  ArrowRight,
} from "lucide-react";
import { PageTransition } from "@/components/shared/PageTransition";
import { PageHeader } from "@/components/shared/PageHeader";
import { MetricCard } from "@/components/shared/MetricCard";
import { StatCard } from "@/components/shared/StatCard";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { BarChartPremium } from "@/components/shared/BarChartPremium";
import { Button } from "@/components/ui/button";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
};

const KPI_CARDS = [
  { label: "Total Transactions", value: "0",        icon: <Activity size={16} />,  variant: "default" as const, featured: true  },
  { label: "Merchants Onboarded", value: "0",       icon: <Building2 size={16} />, variant: "info"    as const, featured: false },
  { label: "Revenue This Month", value: "ZMW 0.00", icon: <Wallet size={16} />,    variant: "success" as const, featured: false },
  { label: "Failed Transactions", value: "0",       icon: <AlertCircle size={16}/>,variant: "danger"  as const, featured: false },
];

const MOCK_TRANSACTIONS = [
  { id: "TXN000001", merchant: "Merchant 1", amount: "ZMW 0.00", status: "completed" as const, date: "Today" },
  { id: "TXN000002", merchant: "Merchant 2", amount: "ZMW 0.00", status: "completed" as const, date: "Today" },
  { id: "TXN000003", merchant: "Merchant 3", amount: "ZMW 0.00", status: "pending"   as const, date: "Today" },
  { id: "TXN000004", merchant: "Merchant 4", amount: "ZMW 0.00", status: "completed" as const, date: "Today" },
  { id: "TXN000005", merchant: "Merchant 5", amount: "ZMW 0.00", status: "failed"    as const, date: "Today" },
];

export const AdminDashboard: React.FC = () => {
  return (
    <PageTransition className="space-y-8">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Platform-wide overview for GeePay NFS."
      />

      {/* Primary KPIs */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {KPI_CARDS.map((card) => (
          <motion.div key={card.label} variants={itemVariants} className="h-full">
            <MetricCard
              label={card.label}
              value={card.value}
              icon={card.icon}
              variant={card.variant}
              featured={card.featured}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Secondary Stats */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <motion.div variants={itemVariants}>
          <StatCard icon={<CheckCircle2 />} label="Transaction Success Rate" value="—" iconVariant="success" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard icon={<Clock />} label="Avg Settlement Time" value="—" iconVariant="sky" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard icon={<Users />} label="Active Merchants" value="0" iconVariant="cobalt" />
        </motion.div>
      </motion.div>

      {/* Chart + Growth Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard
          title="Transaction Volume Trend"
          action={
            <button className="flex items-center gap-1.5 font-sans text-text-sm text-gp-sky hover:text-gp-cobalt transition-colors font-medium">
              View Details <ArrowRight size={14} />
            </button>
          }
          onGrayBg
          className="lg:col-span-2"
        >
          <BarChartPremium />
        </SectionCard>

        <SectionCard title="Platform Growth" onGrayBg>
          <div className="space-y-4">
            {[
              { label: "This Month",   value: "+24%" },
              { label: "This Quarter", value: "+18%" },
              { label: "Year to Date", value: "+42%" },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex justify-between items-center pb-4 border-b border-gray-50 last:border-0 last:pb-0"
              >
                <span className="font-sans text-text-sm text-gray-500 font-medium">{label}</span>
                <span className="font-display font-bold text-text-xl text-gradient-stat tabular-nums">
                  {value}
                </span>
              </div>
            ))}
          </div>
          <Button variant="brand" className="w-full mt-6" size="sm">
            View Full Report
          </Button>
        </SectionCard>
      </div>

      {/* Recent Transactions */}
      <SectionCard
        title="Recent Transactions"
        action={
          <button className="font-sans text-text-sm text-gp-sky hover:text-gp-cobalt transition-colors font-medium">
            View All
          </button>
        }
        onGrayBg
        contentClassName="p-0"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 table-header-rule">
                <th className="font-sans font-semibold text-text-xs text-gray-500 uppercase tracking-wider text-left py-4 px-6">
                  ID
                </th>
                <th className="font-sans font-semibold text-text-xs text-gray-500 uppercase tracking-wider text-left py-4 px-4">
                  Merchant
                </th>
                <th className="font-sans font-semibold text-text-xs text-gray-500 uppercase tracking-wider text-left py-4 px-4">
                  Amount
                </th>
                <th className="font-sans font-semibold text-text-xs text-gray-500 uppercase tracking-wider text-left py-4 px-4">
                  Status
                </th>
                <th className="font-sans font-semibold text-text-xs text-gray-500 uppercase tracking-wider text-left py-4 px-4">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {MOCK_TRANSACTIONS.map((txn, idx) => (
                <motion.tr
                  key={txn.id}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                  className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors cursor-pointer group"
                >
                  <td className="py-4 px-6">
                    <code className="font-mono text-text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                      #{txn.id}
                    </code>
                  </td>
                  <td className="py-4 px-4 font-sans text-text-sm text-gray-700 font-medium group-hover:text-gp-cobalt transition-colors">
                    {txn.merchant}
                  </td>
                  <td className="py-4 px-4 font-mono text-text-sm text-gray-900 tabular-nums font-semibold">
                    {txn.amount}
                  </td>
                  <td className="py-4 px-4">
                    <StatusBadge status={txn.status} />
                  </td>
                  <td className="py-4 px-4 font-mono text-text-xs text-gray-400">
                    {txn.date}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-50">
          <span className="font-sans text-text-sm text-gray-400">
            Showing 5 of 248 transactions
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Previous</Button>
            <Button variant="brand" size="sm">Next</Button>
          </div>
        </div>
      </SectionCard>
    </PageTransition>
  );
};
