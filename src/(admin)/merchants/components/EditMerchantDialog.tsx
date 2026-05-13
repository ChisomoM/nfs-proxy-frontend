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
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { Building2, Loader2, Edit } from 'lucide-react';
import { MerchantService } from '@/lib/api/services';
import { toast } from 'sonner';
import type { Merchant } from '@/types/merchant';

interface EditMerchantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchant: Merchant | null;
  onSuccess: () => void;
}

export const EditMerchantDialog: React.FC<EditMerchantDialogProps> = ({
  open,
  onOpenChange,
  merchant,
  onSuccess
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    business_name: '',
    participant_id: '',
    contact_details: {} as any,
  });

  useEffect(() => {
    if (merchant && open) {
      setFormData({
        business_name: merchant.business_name,
        participant_id: merchant.participant_id,
        contact_details: merchant.contact_details || {},
      });
    }
  }, [merchant, open]);

  const handleSubmit = async () => {
    if (!merchant || !formData.business_name.trim() || !formData.participant_id.trim()) {
      toast.error('Business name and participant ID are required');
      return;
    }

    setIsSubmitting(true);
    try {
      await MerchantService.updateMerchant(merchant.ext_id, {
        business_name: formData.business_name,
        participant_id: formData.participant_id,
        contact_details: formData.contact_details,
      });

      toast.success('Merchant updated successfully');
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update merchant');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateContactDetail = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contact_details: {
        ...prev.contact_details,
        [key]: value,
      },
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 border-none rounded-3xl shadow-2xl">
        <div className="h-1.5 w-full btn-gradient" />

        <div className="p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 rounded-xl">
                  <Edit className="w-5 h-5 text-blue-600" />
                </div>
                <DialogTitle className="text-xl font-display font-semibold">
                  Edit Merchant
                </DialogTitle>
              </div>
              <DialogDescription>
                Update merchant information and contact details.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="business_name" className="text-sm font-medium">
                  Business Name *
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="business_name"
                    placeholder="e.g. Lusaka Electronics Ltd"
                    value={formData.business_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
                    className="pl-10 h-11 rounded-xl border-gray-200 focus:border-blue-500"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="participant_id" className="text-sm font-medium">
                  Participant ID *
                </Label>
                <Input
                  id="participant_id"
                  placeholder="e.g. ZNFS-MERCH-001"
                  value={formData.participant_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, participant_id: e.target.value }))}
                  className="h-11 rounded-xl border-gray-200 focus:border-blue-500"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Contact Phone
                </Label>
                <Input
                  id="phone"
                  placeholder="+260 211 123456"
                  value={formData.contact_details?.phone || ''}
                  onChange={(e) => updateContactDetail('phone', e.target.value)}
                  className="h-11 rounded-xl border-gray-200 focus:border-blue-500"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-11 rounded-xl border-gray-200"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                variant="brand"
                className="h-11 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </div>
                ) : (
                  'Update Merchant'
                )}
              </Button>
            </DialogFooter>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};