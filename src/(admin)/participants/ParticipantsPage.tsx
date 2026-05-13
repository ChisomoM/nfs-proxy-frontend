import React, { useState, useEffect } from 'react';
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
  Users,
  Plus,
  MoreHorizontal,
  Search,
  SearchX,
  Edit,
  Archive
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParticipantService } from '@/lib/api/services';
import { CreateParticipantDialog } from './components/CreateParticipantDialog';
import { EditParticipantDialog } from './components/EditParticipantDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { StatCard } from '@/components/shared/StatCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { PageTransition } from '@/components/shared/PageTransition';
import type { Participant } from '@/types/participant';

const TableSkeleton: React.FC = () => (
  <>
    {Array.from({ length: 3 }).map((_, i) => (
      <TableRow key={i} className="animate-pulse">
        <TableCell className="py-4 pl-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gray-200"></div>
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
              <div className="h-3 w-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </TableCell>
        <TableCell><div className="h-4 w-24 bg-gray-200 rounded"></div></TableCell>
        <TableCell><div className="h-6 w-16 bg-gray-200 rounded-full"></div></TableCell>
        <TableCell><div className="h-4 w-20 bg-gray-200 rounded"></div></TableCell>
        <TableCell><div className="h-8 w-8 bg-gray-200 rounded"></div></TableCell>
      </TableRow>
    ))}
  </>
);

export const ParticipantsPage: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'mno' | 'bank' | 'gateway'>('all');

  const fetchParticipants = async () => {
    setIsLoading(true);
    try {
      const data = await ParticipantService.getParticipants();
      setParticipants(data);
    } catch (err: any) {
      toast.error('Failed to load participants');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, []);

  const filteredParticipants = participants.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.participant_id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || p.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const { sorted: sortedParticipants, sortColumn, sortDirection, handleSort } = useTableSort(filteredParticipants);

  const activeParticipants = participants.filter(p => p.is_active);
  const archivedParticipants = participants.filter(p => !p.is_active);

  const handleArchive = async (participant: Participant) => {
    try {
      await ParticipantService.archiveParticipant(participant.id);
      toast.success('Participant archived successfully');
      fetchParticipants();
    } catch (err: any) {
      toast.error('Failed to archive participant');
      console.error(err);
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'mno': return 'bg-blue-100 text-blue-800';
      case 'bank': return 'bg-green-100 text-green-800';
      case 'gateway': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <PageTransition className="space-y-8">
      <PageHeader
        title="Participants"
        subtitle="Manage banks, MNOs, and payment gateways in the NFS network."
        action={
          <Button variant="brand" className="h-11 px-6" onClick={() => setShowCreateDialog(true)}>
            <Plus size={18} />
            Add Participant
          </Button>
        }
      />

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={<Users />} label="Total Participants" value={participants.length.toString()} iconVariant="cobalt" />
        <StatCard icon={<Users />} label="Active Participants" value={activeParticipants.length.toString()} iconVariant="success" />
        <StatCard icon={<Archive />} label="Archived Participants" value={archivedParticipants.length.toString()} iconVariant="cobalt" />
      </div>

      {/* Filter & Table Area */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search participants by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-white border-gray-200 rounded-xl focus:ring-gp-sky/20 focus:border-gp-sky transition-all"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All' },
              { key: 'mno', label: 'MNO' },
              { key: 'bank', label: 'Bank' },
              { key: 'gateway', label: 'Gateway' }
            ].map(({ key, label }) => (
              <Button
                key={key}
                variant={typeFilter === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTypeFilter(key as any)}
                className={`rounded-lg ${typeFilter === key ? 'bg-gp-cobalt text-white' : 'border-gray-200'}`}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableHeaderRow>
                <SortableTableHead sortKey="name" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} className="pl-6">Participant</SortableTableHead>
                <SortableTableHead sortKey="participant_id" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort}>Participant ID</SortableTableHead>
                <SortableTableHead sortKey="is_active" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort}>Status</SortableTableHead>
                <SortableTableHead sortKey="created_at" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort}>Created At</SortableTableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableHeaderRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeleton />
              ) : sortedParticipants.length > 0 ? (
                sortedParticipants.map((participant, idx) => (
                  <motion.tr
                    key={participant.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                  >
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gp-cobalt-light flex items-center justify-center text-gp-cobalt font-display font-bold text-text-xs">
                          {participant.name?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-sans font-semibold text-text-sm text-gray-900 group-hover:text-gp-cobalt transition-colors block">
                            {participant.name}
                          </span>
                          <Badge className={`text-xs mt-1 ${getTypeBadgeColor(participant.type)}`}>
                            {participant.type.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="font-mono text-text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                        {participant.participant_id}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant={participant.is_active ? "default" : "secondary"} className={participant.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}>
                        {participant.is_active ? 'Active' : 'Archived'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-text-sm text-gray-600">
                        {new Date(participant.created_at).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingParticipant(participant)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <SearchX className="h-12 w-12 text-gray-300" />
                      <div>
                        <p className="font-semibold text-gray-900">No participants found</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {searchQuery || typeFilter !== 'all' ? 'Try adjusting your search or filters' : 'Get started by adding your first participant'}
                        </p>
                      </div>
                      {!searchQuery && typeFilter === 'all' && (
                        <Button
                          onClick={() => setShowCreateDialog(true)}
                          variant="outline"
                          className="mt-2"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Participant
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create Dialog */}
      {showCreateDialog && (
        <CreateParticipantDialog
          onClose={() => setShowCreateDialog(false)}
          onSuccess={() => {
            setShowCreateDialog(false);
            fetchParticipants();
          }}
        />
      )}

      {/* Edit Dialog */}
      {editingParticipant && (
        <EditParticipantDialog
          participant={editingParticipant}
          onClose={() => setEditingParticipant(null)}
          onSuccess={() => {
            setEditingParticipant(null);
            fetchParticipants();
          }}
        />
      )}
    </PageTransition>
  );
};