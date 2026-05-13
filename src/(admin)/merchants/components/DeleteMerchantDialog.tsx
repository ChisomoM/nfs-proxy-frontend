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
import { motion } from 'framer-motion';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { MerchantService } from '@/lib/api/services';
import { toast } from 'sonner';
import type { Merchant } from '@/types/merchant';

interface DeleteMerchantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchant: Merchant | null;
  onSuccess: () => void;
}

export const DeleteMerchantDialog: React.FC<DeleteMerchantDialogProps> = ({
  open,
  onOpenChange,
  merchant,
  onSuccess
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDelete = async () => {
    if (!merchant) return;

    setIsSubmitting(true);
    try {
      await MerchantService.deleteMerchant(merchant.ext_id);
      toast.success('Merchant deleted successfully');
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete merchant');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 border-none rounded-3xl shadow-2xl">
        <div className="h-1.5 w-full bg-red-500" />

        <div className="p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-50 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <DialogTitle className="text-xl font-display font-semibold text-red-900">
                  Delete Merchant
                </DialogTitle>
              </div>
              <DialogDescription className="text-gray-600">
                This action cannot be undone. The merchant will be soft-deleted and hidden from all lists,
                but their data will be preserved for audit purposes.
              </DialogDescription>
            </DialogHeader>

            {merchant && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="font-medium text-red-900">{merchant.business_name}</p>
                    <p className="text-sm text-red-700">ID: {merchant.ext_id}</p>
                  </div>
                </div>
              </div>
            )}

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
                onClick={handleDelete}
                variant="destructive"
                className="h-11 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </div>
                ) : (
                  'Delete Merchant'
                )}
              </Button>
            </DialogFooter>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};