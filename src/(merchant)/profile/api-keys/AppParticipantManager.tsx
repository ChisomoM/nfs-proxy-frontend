import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Users,
  Plus,
  X,
  Search,
  SearchX,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { AppParticipantService } from '@/lib/api/services';
import type { Participant } from '@/types/participant';

interface AppParticipantManagerProps {
  projectId: string;
}

const ParticipantRow: React.FC<{
  participant: Participant;
  onRemove: (participant: Participant) => void;
  isRemoving: boolean;
}> = ({ participant, onRemove, isRemoving }) => {
  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'mno': return 'bg-blue-100 text-blue-800';
      case 'bank': return 'bg-green-100 text-green-800';
      case 'gateway': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gp-cobalt-light flex items-center justify-center text-gp-cobalt font-display font-bold text-sm">
          {participant.name?.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <span className="font-semibold text-gray-900 block">{participant.name}</span>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={`text-xs ${getTypeBadgeColor(participant.type)}`}>
              {participant.type.toUpperCase()}
            </Badge>
            <code className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
              {participant.participant_id}
            </code>
          </div>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(participant)}
        disabled={isRemoving}
        className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
      >
        {isRemoving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <X className="h-4 w-4" />
        )}
      </Button>
    </motion.div>
  );
};

const AvailableParticipantRow: React.FC<{
  participant: Participant;
  onAdd: (participant: Participant) => void;
  isAdding: boolean;
}> = ({ participant, onAdd, isAdding }) => {
  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'mno': return 'bg-blue-100 text-blue-800';
      case 'bank': return 'bg-green-100 text-green-800';
      case 'gateway': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gp-cobalt-light flex items-center justify-center text-gp-cobalt font-display font-bold text-sm">
          {participant.name?.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <span className="font-semibold text-gray-900 block">{participant.name}</span>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={`text-xs ${getTypeBadgeColor(participant.type)}`}>
              {participant.type.toUpperCase()}
            </Badge>
            <code className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
              {participant.participant_id}
            </code>
          </div>
        </div>
      </div>
      <Button
        onClick={() => onAdd(participant)}
        disabled={isAdding}
        size="sm"
        className="h-8 px-3 rounded-lg bg-gp-cobalt hover:bg-gp-cobalt-dark text-white"
      >
        {isAdding ? (
          <Loader2 className="h-4 w-4 animate-spin mr-1" />
        ) : (
          <Plus className="h-4 w-4 mr-1" />
        )}
        Add
      </Button>
    </motion.div>
  );
};

export const AppParticipantManager: React.FC<AppParticipantManagerProps> = ({ projectId }) => {
  const [whitelistedParticipants, setWhitelistedParticipants] = useState<Participant[]>([]);
  const [allParticipants, setAllParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingParticipants, setIsAddingParticipants] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'mno' | 'bank' | 'gateway'>('all');
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);

  const fetchWhitelistedParticipants = async () => {
    try {
      const data = await AppParticipantService.listAppParticipants(projectId);
      setWhitelistedParticipants(data);
    } catch (err: any) {
      toast.error('Failed to load whitelisted participants');
      console.error(err);
    }
  };

  const fetchAllParticipants = async () => {
    try {
      const data = await AppParticipantService.listAllParticipants();
      setAllParticipants(data);
    } catch (err: any) {
      toast.error('Failed to load available participants');
      console.error(err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchWhitelistedParticipants(), fetchAllParticipants()]);
      setIsLoading(false);
    };
    loadData();
  }, [projectId]);

  const availableParticipants = allParticipants.filter(p =>
    !whitelistedParticipants.some(wp => wp.participant_id === p.participant_id) &&
    p.is_active &&
    (typeFilter === 'all' || p.type === typeFilter) &&
    (p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     p.participant_id?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddParticipant = async (participant: Participant) => {
    setAddingId(participant.id);
    try {
      await AppParticipantService.addParticipant(projectId, participant.participant_id);
      setWhitelistedParticipants(prev => [...prev, participant]);
      toast.success(`${participant.name} added to whitelist`);
    } catch (err: any) {
      toast.error('Failed to add participant');
      console.error(err);
    } finally {
      setAddingId(null);
    }
  };

  const handleRemoveParticipant = async (participant: Participant) => {
    setRemovingId(participant.participant_id);
    try {
      await AppParticipantService.removeParticipant(projectId, participant.participant_id);
      setWhitelistedParticipants(prev => prev.filter(p => p.participant_id !== participant.participant_id));
      toast.success(`${participant.name} removed from whitelist`);
    } catch (err: any) {
      toast.error('Failed to remove participant');
      console.error(err);
    } finally {
      setRemovingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded-xl"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Whitelisted Participants Section */}
      <Card className="bg-white border border-gray-100 shadow-sm rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-display font-semibold text-display-xs text-gray-900">
                Whitelisted Participants
              </CardTitle>
              <p className="font-sans text-text-sm text-gray-500 mt-1">
                These institutions can be used by this app for transactions
              </p>
            </div>
            <Button
              onClick={() => setIsAddingParticipants(true)}
              variant="brand"
              size="sm"
              className="h-9 px-4 rounded-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Participants
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {whitelistedParticipants.length > 0 ? (
            <div className="space-y-3">
              <AnimatePresence>
                {whitelistedParticipants.map(participant => (
                  <ParticipantRow
                    key={participant.participant_id}
                    participant={participant}
                    onRemove={handleRemoveParticipant}
                    isRemoving={removingId === participant.participant_id}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">No participants whitelisted</h3>
              <p className="text-sm text-gray-500 mb-4">
                Add participants to control which institutions this app can interact with.
              </p>
              <Button
                onClick={() => setIsAddingParticipants(true)}
                variant="outline"
                className="rounded-xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Participants
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Participants Panel */}
      <AnimatePresence>
        {isAddingParticipants && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="bg-white border border-gray-100 shadow-sm rounded-2xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-display font-semibold text-display-xs text-gray-900">
                      Add Participants
                    </CardTitle>
                    <p className="font-sans text-text-sm text-gray-500 mt-1">
                      Select participants to whitelist for this app
                    </p>
                  </div>
                  <Button
                    onClick={() => setIsAddingParticipants(false)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search and Filter */}
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search participants..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-10 rounded-xl border-gray-200"
                    />
                  </div>
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

                {/* Available Participants */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {availableParticipants.length > 0 ? (
                    availableParticipants.map(participant => (
                      <AvailableParticipantRow
                        key={participant.id}
                        participant={participant}
                        onAdd={handleAddParticipant}
                        isAdding={addingId === participant.id}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <SearchX className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        {searchQuery || typeFilter !== 'all' ? 'No participants match your search' : 'No available participants'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <Button
                    onClick={() => setIsAddingParticipants(false)}
                    variant="brand"
                    className="h-10 px-6 rounded-xl"
                  >
                    Done
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};