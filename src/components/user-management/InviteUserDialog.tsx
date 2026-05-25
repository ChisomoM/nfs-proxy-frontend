import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (data: { email: string; name: string; role: string }) => Promise<void>;
  isLoading?: boolean;
}

export const InviteUserDialog: React.FC<InviteUserDialogProps> = ({
  open,
  onOpenChange,
  onInvite,
  isLoading = false,
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('member');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !name) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      await onInvite({ email, name, role });
      setEmail('');
      setName('');
      setRole('member');
      onOpenChange(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail size={20} className="text-gp-cobalt" />
            Invite User
          </DialogTitle>
          <DialogDescription>
            Send an invitation to a new user to join your team.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-text-sm font-semibold">
              Full Name *
            </Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className="mt-2 bg-white border-gray-200 rounded-xl focus:ring-gp-sky/20 focus:border-gp-sky transition-all"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-text-sm font-semibold">
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="mt-2 bg-white border-gray-200 rounded-xl focus:ring-gp-sky/20 focus:border-gp-sky transition-all"
            />
          </div>

          <div>
            <Label htmlFor="role" className="text-text-sm font-semibold">
              Role
            </Label>
            <Select value={role} onValueChange={setRole} disabled={isLoading}>
              <SelectTrigger className="mt-2 bg-white border-gray-200 rounded-xl focus:ring-gp-sky/20 focus:border-gp-sky transition-all">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="brand"
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              Send Invite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
