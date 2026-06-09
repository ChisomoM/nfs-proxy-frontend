import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Loader2, AlertCircle, Users, ShieldAlert, UserCheck } from 'lucide-react';
import { PageTransition } from '@/components/shared/PageTransition';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { UserTable } from '@/components/user-management/UserTable';
import { InviteUserDialog } from '@/components/user-management/InviteUserDialog';
import { StatCard } from '@/components/shared/StatCard';
import { fetchData } from '@/lib/api/crud';
import { getRoute, pipe } from '@/lib/api/end_points';
import type { User, UserStatus } from '@/types/auth';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'locked', label: 'Locked' },
];

export const AdminUsersPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'staff' | 'merchants'>('staff');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [merchantFilter, setMerchantFilter] = useState('');

  const [staffUsers, setStaffUsers] = useState<User[]>([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [staffError, setStaffError] = useState<string | null>(null);

  const [merchantUsers, setMerchantUsers] = useState<User[]>([]);
  const [merchantLoading, setMerchantLoading] = useState(true);
  const [merchantError, setMerchantError] = useState<string | null>(null);

  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  const buildQuery = useCallback((): Record<string, string> => {
    const q: Record<string, string> = {};
    if (statusFilter !== 'all') q.status = statusFilter;
    if (searchQuery.trim()) q.email = searchQuery.trim();
    return q;
  }, [statusFilter, searchQuery]);

  const fetchStaff = useCallback(async () => {
    setStaffLoading(true);
    setStaffError(null);
    try {
      const response = await fetchData('LIST_SYSTEM_USERS', 'GET', {}, null, buildQuery());
      const list = response?.data ?? response;
      setStaffUsers(Array.isArray(list) ? list : []);
    } catch {
      setStaffError('Failed to load staff users');
      toast.error('Failed to load staff users');
    } finally {
      setStaffLoading(false);
    }
  }, [buildQuery]);

  const fetchMerchantAdmins = useCallback(async () => {
    setMerchantLoading(true);
    setMerchantError(null);
    try {
      const q = buildQuery();
      if (merchantFilter.trim()) q.merchant_id = merchantFilter.trim();
      const response = await fetchData('LIST_MERCHANT_ADMINS', 'GET', {}, null, q);
      const list = response?.data ?? response;
      setMerchantUsers(Array.isArray(list) ? list : []);
    } catch {
      setMerchantError('Failed to load merchant admins');
      toast.error('Failed to load merchant admins');
    } finally {
      setMerchantLoading(false);
    }
  }, [buildQuery, merchantFilter]);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);
  useEffect(() => { fetchMerchantAdmins(); }, [fetchMerchantAdmins]);

  const currentUsers = activeTab === 'staff' ? staffUsers : merchantUsers;
  const currentError = activeTab === 'staff' ? staffError : merchantError;
  const currentRefetch = activeTab === 'staff' ? fetchStaff : fetchMerchantAdmins;

  const activeCount = currentUsers.filter(u => u.status === 'active').length;
  const pendingCount = currentUsers.filter(u => u.status === 'pending' || u.status === 'invited').length;
  const suspendedCount = currentUsers.filter(u => u.status === 'suspended' || u.status === 'locked').length;

  const handleInviteUser = async (data: { email: string; name: string; role: string }) => {
    setIsInviting(true);
    try {
      await fetchData('INVITE_SYSTEM_USER', 'POST', {}, {
        email: data.email,
        name: data.name,
        role: data.role,
        is_staff: true,
      });
      toast.success('Invitation sent successfully');
      fetchStaff();
    } catch (err: any) {
      toast.error(err.message || 'Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const handleSetStatus = async (user: User, status: UserStatus) => {
    try {
      const key = activeTab === 'staff' ? 'SET_STATUS_SYSTEM_USER' : 'RESEND_INVITE_MERCHANT_USER';
      if (activeTab === 'staff') {
        await fetchData(key, 'PATCH', { user_id: user.id }, { status });
      } else {
        await fetchData('UPDATE_MERCHANT_USER', 'PATCH', { user_id: user.id }, { status });
      }
      toast.success(`User ${status === 'active' ? 'activated' : status}`);
      currentRefetch();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const handleResendInvite = async (user: User) => {
    const key = activeTab === 'staff' ? 'RESEND_INVITE_SYSTEM_USER' : 'RESEND_INVITE_MERCHANT_USER';
    try {
      await fetchData(key, 'POST', { user_id: user.id });
      toast.success('Invitation resent successfully');
    } catch {
      toast.error('Failed to resend invitation');
    }
  };

  const handleResetPassword = async (user: User) => {
    const key = activeTab === 'staff' ? 'RESET_PASSWORD_SYSTEM_USER' : 'RESET_PASSWORD_MERCHANT_USER';
    try {
      await fetchData(key, 'POST', { user_id: user.id });
      toast.success('Password reset email sent');
    } catch {
      toast.error('Failed to send password reset');
    }
  };

  const handleDelete = async (user: User) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    const key = activeTab === 'staff' ? 'DELETE_SYSTEM_USER' : 'DELETE_MERCHANT_USER';
    try {
      await fetchData(key, 'DELETE', { user_id: user.id });
      toast.success('User removed');
      currentRefetch();
    } catch {
      toast.error('Failed to remove user');
    }
  };

  return (
    <PageTransition className="space-y-8">
      <PageHeader
        title="User Management"
        subtitle="Manage GeePay staff accounts and merchant administrators."
        action={
          activeTab === 'staff' ? (
            <Button variant="brand" className="h-11 px-6 gap-2" onClick={() => setShowInviteDialog(true)}>
              <Plus size={16} />
              Invite User
            </Button>
          ) : undefined
        }
      />

      <motion.div variants={containerVariants} initial="hidden" animate="visible"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div variants={itemVariants}>
          <StatCard icon={<UserCheck />} label="Active" value={activeCount.toString()} iconVariant="success" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard icon={<Users />} label="Pending" value={pendingCount.toString()} iconVariant="sky" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard icon={<ShieldAlert />} label="Suspended / Locked" value={suspendedCount.toString()} iconVariant="cobalt" />
        </motion.div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'staff' | 'merchants')}>
        <TabsList className="mb-2">
          <TabsTrigger value="staff">GeePay Staff</TabsTrigger>
          <TabsTrigger value="merchants">Merchant Admins</TabsTrigger>
        </TabsList>

        {/* Filters */}
        <div className="bg-white rounded-2xl border-gradient shadow-sm p-4 flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by email…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-white border-gray-200 rounded-xl"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44 h-10 rounded-xl border-gray-200 bg-white">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {activeTab === 'merchants' && (
            <Input
              placeholder="Filter by merchant ID…"
              value={merchantFilter}
              onChange={(e) => setMerchantFilter(e.target.value)}
              className="w-52 h-10 bg-white border-gray-200 rounded-xl"
            />
          )}
        </div>

        {currentError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 mb-4">
            <AlertCircle size={20} className="text-red-600 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900 text-text-sm">{currentError}</p>
              <Button variant="ghost" size="sm" onClick={currentRefetch} className="mt-2 text-red-600">
                Try Again
              </Button>
            </div>
          </div>
        )}

        <TabsContent value="staff">
          {staffLoading ? (
            <div className="text-center py-16 text-gray-400 text-text-sm">
              <Loader2 className="animate-spin mx-auto mb-3" size={24} />
              Loading users…
            </div>
          ) : (
            <UserTable
              users={staffUsers}
              isLoading={staffLoading}
              onViewDetails={(u) => navigate(`/admin/users/${u.id}`)}
              onResendInvite={handleResendInvite}
              onResetPassword={handleResetPassword}
              onDeactivate={(u) => handleSetStatus(u, u.status === 'active' ? 'suspended' : 'active')}
              onDelete={handleDelete}
              onViewAudit={undefined}
            />
          )}
        </TabsContent>

        <TabsContent value="merchants">
          {merchantLoading ? (
            <div className="text-center py-16 text-gray-400 text-text-sm">
              <Loader2 className="animate-spin mx-auto mb-3" size={24} />
              Loading merchant admins…
            </div>
          ) : (
            <UserTable
              users={merchantUsers}
              isLoading={merchantLoading}
              onViewDetails={(u) => navigate(`/admin/users/${u.id}`)}
              onResendInvite={handleResendInvite}
              onResetPassword={handleResetPassword}
              onDeactivate={(u) => handleSetStatus(u, u.status === 'active' ? 'suspended' : 'active')}
              onDelete={handleDelete}
              onViewAudit={undefined}
            />
          )}
        </TabsContent>
      </Tabs>

      <InviteUserDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        onInvite={handleInviteUser}
        isLoading={isInviting}
      />
    </PageTransition>
  );
};

export default AdminUsersPage;
