import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Users, Loader2 } from 'lucide-react';
import { ParticipantService } from '@/lib/api/services';
import { toast } from 'sonner';
import type { Participant, CreateParticipantInput } from '@/types/participant';

interface EditParticipantDialogProps {
  participant: Participant;
  onClose: () => void;
  onSuccess: () => void;
}

const FormInput: React.FC<{
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}> = ({ label, placeholder, value, onChange, required = false }) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </Label>
    <Input
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-11 rounded-xl border-gray-200 focus:ring-gp-sky/20 focus:border-gp-sky"
      required={required}
    />
  </div>
);

const Header: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <DialogHeader className="text-center pb-4">
    <div className="mx-auto w-12 h-12 bg-gp-cobalt-light rounded-xl flex items-center justify-center mb-4">
      <Users className="w-6 h-6 text-gp-cobalt" />
    </div>
    <DialogTitle className="text-xl font-bold text-gray-900">{title}</DialogTitle>
    <DialogDescription className="text-gray-500 mt-2">{description}</DialogDescription>
  </DialogHeader>
);

export const EditParticipantDialog: React.FC<EditParticipantDialogProps> = ({
  participant,
  onClose,
  onSuccess
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateParticipantInput>({
    name: participant.name || '',
    type: participant.type || '',
    participant_id: participant.participant_id || '',
    logo: participant.logo || '',
  });

  const handleUpdate = async () => {
    if (!formData.name || !formData.type || !formData.participant_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await ParticipantService.updateParticipant(participant.id, formData);
      toast.success('Participant updated successfully');
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update participant');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(val) => {
      if (!isSubmitting && !val) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[500px] p-0 border-none rounded-3xl shadow-2xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-gp-cobalt to-gp-sky" />

        <div className="p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Header
              title="Edit Participant"
              description="Update participant information in the NFS network."
            />

            <div className="space-y-4">
              <FormInput
                label="Participant Name"
                placeholder="e.g. Zambia National Commercial Bank"
                value={formData.name}
                onChange={(v) => setFormData({...formData, name: v})}
                required
              />

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Type <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                  <SelectTrigger className="h-11 rounded-xl border-gray-200 focus:ring-gp-sky/20 focus:border-gp-sky">
                    <SelectValue placeholder="Select participant type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">Bank</SelectItem>
                    <SelectItem value="mno">MNO (Mobile Network Operator)</SelectItem>
                    <SelectItem value="gateway">Payment Gateway</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <FormInput
                label="Participant ID"
                placeholder="e.g. ZNCB-001"
                value={formData.participant_id}
                onChange={(v) => setFormData({...formData, participant_id: v})}
                required
              />

              <FormInput
                label="Logo URL (Optional)"
                placeholder="https://example.com/logo.png"
                value={formData.logo}
                onChange={(v) => setFormData({...formData, logo: v})}
              />
            </div>

            <DialogFooter className="pt-4 flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 h-11 rounded-xl border-gray-200"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                variant="brand"
                className="flex-1 h-11 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating...</span>
                  </div>
                ) : (
                  <span>Update Participant</span>
                )}
              </Button>
            </DialogFooter>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};