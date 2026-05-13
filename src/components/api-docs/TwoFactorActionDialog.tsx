/**
 * Two Factor Action Dialog
 * Real OTP input version for API key security
 */

import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface TwoFactorActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeyId: string;
  action: 'copy' | 'unpause' | 'regenerate';
  title: string;
  description: string;
  onSuccess: (code: string) => Promise<void>;
}

export const TwoFactorActionDialog: React.FC<TwoFactorActionDialogProps> = ({
  isOpen,
  onClose,
  apiKeyId: _apiKeyId,
  action: _action,
  title,
  description,
  onSuccess,
}) => {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!code || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSuccess(code);
      setCode('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
            <div className="mt-4 space-y-2 text-left">
              <Label htmlFor="otp-code">Verification Code</Label>
              <Input
                id="otp-code"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                className="text-center text-lg tracking-widest font-mono"
                autoFocus
                onKeyDown={(e) => {
                   if(e.key === 'Enter') {
                     // Trigger confirm manually since AlertDialogAction is not a button type submit here easily
                   }
                }}
              />
              <p className="text-[10px] text-gray-500">
                A verification code has been sent to your registered email address.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => {
            setCode('');
            onClose();
          }}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            disabled={code.length < 4 || isSubmitting}
            className="btn-gradient"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : 'Verify & Proceed'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};