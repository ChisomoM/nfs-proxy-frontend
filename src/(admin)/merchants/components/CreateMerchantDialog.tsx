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
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Mail, User, ShieldCheck, Loader2, CheckCircle2, Copy, ExternalLink } from 'lucide-react';
import { post } from '@/lib/api/crud';
import { toast } from 'sonner';

interface CreateMerchantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type Step = 'details' | 'admin' | 'success';

export const CreateMerchantDialog: React.FC<CreateMerchantDialogProps> = ({ 
  open, 
  onOpenChange,
  onSuccess 
}) => {
  const [step, setStep] = useState<Step>('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [merchantData, setMerchantData] = useState({
    business_name: '',
    participant_id: '',
  });
  const [adminData, setAdminData] = useState({
    email: '',
    password: '',
  });
  const [response, setResponse] = useState<any>(null);

  const resetForm = () => {
    setStep('details');
    setMerchantData({ business_name: '', participant_id: '' });
    setAdminData({ email: '', password: '' });
    setResponse(null);
  };

  const handleNext = () => {
    if (!merchantData.business_name || !merchantData.participant_id) {
      toast.error('Please fill in all merchant details');
      return;
    }
    setStep('admin');
  };

  const handleCreate = async () => {
    if (!adminData.email || !adminData.password) {
      toast.error('Please fill in admin details');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create Merchant
      const result = await post('CREATE_MERCHANT', {
        business_name: merchantData.business_name,
        participant_id: merchantData.participant_id,
        contact_details: { email: adminData.email }
      });

      // 2. Accept Invite Directly (Set the admin password)
      if (result.invite_token) {
        await post('ACCEPT_INVITE', {
          invite_token: result.invite_token,
          password: adminData.password
        });
      }

      setResponse(result);
      setStep('success');
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Failed to onboard merchant');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyInviteUrl = () => {
    if (response?.invite_url) {
      navigator.clipboard.writeText(response.invite_url);
      toast.success('Invite URL copied to clipboard');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!isSubmitting) {
        onOpenChange(val);
        if (!val) setTimeout(resetForm, 300);
      }
    }}>
      <DialogContent className="sm:max-w-[500px] p-0 border-none rounded-3xl shadow-2xl">
        <div className="h-1.5 w-full btn-gradient" />
        
        <div className="p-8">
          <AnimatePresence mode="wait">
            {step === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Header 
                  title="Onboard New Merchant" 
                  description="Register a new participant in the GeePay NFS ecosystem."
                />
                
                <div className="space-y-4">
                  <FormInput 
                    label="Business Name" 
                    icon={<Building2 className="w-4 h-4" />}
                    placeholder="e.g. Lusaka Electronics Ltd"
                    value={merchantData.business_name}
                    onChange={(v) => setMerchantData({...merchantData, business_name: v})}
                  />
                  <FormInput 
                    label="Participant ID" 
                    icon={<ShieldCheck className="w-4 h-4" />}
                    placeholder="e.g. ZNFS-MERCH-001"
                    value={merchantData.participant_id}
                    onChange={(v) => setMerchantData({...merchantData, participant_id: v})}
                  />
                </div>

                <DialogFooter className="pt-4">
                  <Button 
                    onClick={handleNext}
                    variant="brand"
                    className="w-full h-11 rounded-xl font-medium"
                  >
                    Continue to Admin Setup
                  </Button>
                </DialogFooter>
              </motion.div>
            )}

            {step === 'admin' && (
              <motion.div
                key="admin"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Header 
                  title="Set Merchant Admin" 
                  description="Create the primary administrative account for this merchant."
                />
                
                <div className="space-y-4">
                  <FormInput 
                    label="Admin Email Address" 
                    icon={<Mail className="w-4 h-4" />}
                    placeholder="admin@merchant.com"
                    type="email"
                    value={adminData.email}
                    onChange={(v) => setAdminData({...adminData, email: v})}
                  />
                  <FormInput 
                    label="Initial Password" 
                    icon={<User className="w-4 h-4" />}
                    placeholder="••••••••"
                    type="password"
                    value={adminData.password}
                    onChange={(v) => setAdminData({...adminData, password: v})}
                  />
                </div>

                <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep('details')}
                    className="flex-1 h-11 rounded-xl border-gray-200"
                    disabled={isSubmitting}
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleCreate}
                    variant="brand"
                    className="flex-[2] h-11 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Provisioning...</span>
                      </div>
                    ) : (
                      "Complete Onboarding"
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
                className="text-center py-4 space-y-6"
              >
                <div className="flex justify-center">
                  <div className="h-20 w-20 rounded-full bg-green-50 flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                  </div>
                </div>
                
                <Header 
                  title="Merchant Onboarded Successfully" 
                  description={`${merchantData.business_name} has been registered and the admin account is ready.`}
                />

                <div className="bg-gray-50 rounded-2xl p-5 text-left space-y-3 border border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Invite URL</span>
                    <button 
                      onClick={copyInviteUrl}
                      className="text-gp-sky hover:text-gp-cobalt p-1 rounded-md hover:bg-white transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="font-mono text-[11px] text-gray-500 break-all bg-white p-3 rounded-lg border border-gray-100">
                    {response?.invite_url}
                  </div>
                </div>

                <Button 
                  onClick={() => onOpenChange(false)}
                  variant="brand"
                  className="w-full h-11 rounded-xl font-medium"
                >
                  Return to Merchant List
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Header = ({ title, description }: { title: string, description: string }) => (
  <div className="space-y-1">
    <DialogTitle className="font-display text-2xl font-bold text-gray-900 tracking-tight">{title}</DialogTitle>
    <DialogDescription className="font-sans text-sm text-gray-500">{description}</DialogDescription>
  </div>
);

const FormInput = ({ label, value, onChange, placeholder, icon, type = "text" }: any) => (
  <div className="space-y-2">
    <Label className="font-sans text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
      {label}
    </Label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gp-sky transition-colors">
        {icon}
      </div>
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 pl-11 pr-4 rounded-xl border-gray-200 focus:ring-2 focus:ring-gp-sky/20 focus:border-gp-sky transition-all duration-200"
      />
    </div>
  </div>
);
