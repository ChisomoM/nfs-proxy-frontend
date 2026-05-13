import React, { useState } from 'react';
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
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Loader2, CheckCircle2 } from 'lucide-react';
import { ParticipantService } from '@/lib/api/services';
import { toast } from 'sonner';
import type { CreateParticipantInput } from '@/types/participant';

interface CreateParticipantDialogProps {
  onClose: () => void;
  onSuccess: () => void;
}

type Step = 'form' | 'success';

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

export const CreateParticipantDialog: React.FC<CreateParticipantDialogProps> = ({
  onClose,
  onSuccess
}) => {
  const [step, setStep] = useState<Step>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateParticipantInput>({
    name: '',
    type: '',
    participant_id: '',
    logo: '',
  });
  const [response, setResponse] = useState<any>(null);

  const resetForm = () => {
    setStep('form');
    setFormData({
      name: '',
      type: '',
      participant_id: '',
      logo: '',
    });
    setResponse(null);
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.type || !formData.participant_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await ParticipantService.createParticipant(formData);
      setResponse(result);
      setStep('success');
      toast.success('Participant created successfully');
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create participant');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(val) => {
      if (!isSubmitting && !val) {
        onClose();
        setTimeout(resetForm, 300);
      }
    }}>
      <DialogContent className="sm:max-w-[500px] p-0 border-none rounded-3xl shadow-2xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-gp-cobalt to-gp-sky" />

        <div className="p-8">
          <AnimatePresence mode="wait">
            {step === 'form' && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Header
                  title="Add New Participant"
                  description="Register a new bank, MNO, or payment gateway in the NFS network."
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

                <DialogFooter className="pt-4">
                  <Button
                    onClick={handleCreate}
                    variant="brand"
                    className="w-full h-11 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Creating Participant...</span>
                      </div>
                    ) : (
                      <span>Create Participant</span>
                    )}
                  </Button>
                </DialogFooter>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6 text-center"
              >
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Participant Created!</h3>
                  <p className="text-gray-600 mb-4">
                    {response?.name} has been successfully added to the NFS network.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 text-left">
                    <div className="text-sm text-gray-600 space-y-1">
                      <div><strong>Name:</strong> {response?.name}</div>
                      <div><strong>ID:</strong> <code className="bg-gray-200 px-1 rounded text-xs">{response?.participant_id}</code></div>
                      <div><strong>Type:</strong> {response?.type?.toUpperCase()}</div>
                    </div>
                  </div>
                </div>

                <DialogFooter className="pt-4">
                  <Button
                    onClick={() => {
                      onClose();
                      setTimeout(resetForm, 300);
                    }}
                    variant="brand"
                    className="w-full h-11 rounded-xl font-medium"
                  >
                    View Participants
                  </Button>
                </DialogFooter>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};