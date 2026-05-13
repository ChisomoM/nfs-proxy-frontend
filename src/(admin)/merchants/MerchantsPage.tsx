import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableHeaderRow,
  TableRow,
  SortableTableHead,
} from '@/components/ui/table';
import { useTableSort } from '@/hooks/useTableSort';
import {
  Building2,
  Plus,
  MoreHorizontal,
  ShieldCheck,
  Search,
  Users,
  SearchX
} from 'lucide-react';
import { motion } from 'framer-motion';
import { list } from '@/lib/api/crud';
import { CreateMerchantDialog } from './components/CreateMerchantDialog';
import { Input } from '@/components/ui/input';
import { StatCard } from '@/components/shared/StatCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { PageTransition } from '@/components/shared/PageTransition';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

export const MerchantsPage: React.FC = () => {
  const navigate = useNavigate();
  const [merchants, setMerchants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMerchants = async () => {
    setIsLoading(true);
    try {
      const data = await list('LIST_MERCHANTS');
      setMerchants(data.merchants || []);
    } catch (err: any) {
      toast.error('Failed to load merchants');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants();
  }, []);

  const filteredMerchants = merchants.filter(m =>
    m.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.participant_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const { sorted: sortedMerchants, sortColumn, sortDirection, handleSort } = useTableSort(filteredMerchants);

  return (
    <PageTransition className="space-y-8">
      <PageHeader
        title="Merchants"
        subtitle="Manage participants and connection parameters for the NFS Proxy."
        action={
          <Button variant="brand" className="h-11 px-6" onClick={() => setShowCreateDialog(true)}>
            <Plus size={16} />
            Onboard Merchant
          </Button>
        }
      />

      {/* Stats Quick Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <motion.div variants={itemVariants}>
          <StatCard icon={<Building2 />} label="Total Merchants" value={merchants.length.toString()} iconVariant="cobalt" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard icon={<ShieldCheck />} label="Active Participants" value={merchants.filter(m => m.status === 'active' || true).length.toString()} iconVariant="sky" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard icon={<Users />} label="New This Month" value="0" iconVariant="cobalt" />
        </motion.div>
      </motion.div>

      {/* Filter & Table Area */}
      <div className="bg-white rounded-2xl border-gradient shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search merchants by name or ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-white border-gray-200 rounded-xl focus:ring-gp-sky/20 focus:border-gp-sky transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableHeaderRow>
                <SortableTableHead sortKey="business_name" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} className="pl-6">Merchant</SortableTableHead>
                <SortableTableHead sortKey="participant_id" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort}>Participant ID</SortableTableHead>
                <TableHead>Status</TableHead>
                <SortableTableHead sortKey="created_at" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort}>Created At</SortableTableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableHeaderRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeleton />
              ) : sortedMerchants.length > 0 ? (
                sortedMerchants.map((merchant, idx) => (
                  <TableRow
                    key={merchant.id || idx}
                    onClick={() => {
                      if (merchant.id) {
                        navigate(`/admin/merchants/${merchant.id}`);
                      }
                    }}
                    className="group border-b border-gray-50 hover:bg-gray-50/60 transition-colors cursor-pointer"
                  >
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gp-cobalt-light flex items-center justify-center text-gp-cobalt font-display font-bold text-text-xs">
                          {merchant.business_name?.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-sans font-semibold text-text-sm text-gray-900 group-hover:text-gp-cobalt transition-colors">
                          {merchant.business_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="font-mono text-text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                        {merchant.participant_id}
                      </code>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-sans text-[10px] font-bold uppercase tracking-wider bg-success-light text-success-fg">
                        Active
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-text-xs text-gray-400">
                      {merchant.created_at ? new Date(merchant.created_at).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="pr-6">
                      <div className="flex justify-end">
                        <motion.button
                          onClick={(e) => e.stopPropagation()}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.85 }}
                          transition={{ type: 'spring', stiffness: 600, damping: 32 }}
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-150 outline-none"
                        >
                          <MoreHorizontal size={16} />
                        </motion.button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300">
                        <SearchX size={24} />
                      </div>
                      <div className="space-y-1">
                        <p className="font-display font-semibold text-gray-900">No merchants found</p>
                        <p className="font-sans text-sm text-gray-500">
                          {searchQuery ? `No results for "${searchQuery}"` : 'Start by onboarding your first merchant.'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <CreateMerchantDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
        onSuccess={fetchMerchants}
      />
    </PageTransition>
  );
};

const TableSkeleton = () => (
  <>
    {[1, 2, 3].map((i) => (
      <TableRow key={i}>
        <TableCell className="pl-6"><div className="h-4 w-40 skeleton" /></TableCell>
        <TableCell><div className="h-4 w-24 skeleton" /></TableCell>
        <TableCell><div className="h-4 w-16 skeleton" /></TableCell>
        <TableCell><div className="h-4 w-20 skeleton" /></TableCell>
        <TableCell><div className="h-8 w-8 rounded-lg skeleton" /></TableCell>
      </TableRow>
    ))}
  </>
);
