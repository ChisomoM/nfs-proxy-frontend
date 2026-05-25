import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Loader2, AlertCircle, Users } from 'lucide-react';
import { PageTransition } from '@/components/shared/PageTransition';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import { UserTable } from '@/components/user-management/UserTable';
import { InviteUserDialog } from '@/components/user-management/InviteUserDialog';
import { StatCard } from '@/components/shared/StatCard';
import { fetchData } from '@/lib/api/crud';
import { getRoute, pipe } from '@/lib/api/end_points';
import type { User } from '@/types/auth';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchData(getRoute('LIST_SYSTEM_USERS'), 'GET');
      if (response && Array.isArray(response.users)) {
        setUsers(response.users);
      } else if (Array.isArray(response)) {
        setUsers(response);
      } else {
        setUsers([]);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to load users');
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeUsers = users.filter((u) => u.status === 'active').length;
  const invitedUsers = users.filter((u) => u.status === 'invited').length;

  const handleInviteUser = async (data: { email: string; name: string; role: string }) => {
    setIsInviting(true);
    try {
      const response = await fetchData(
        getRoute('INVITE_SYSTEM_USER'),
        'POST',
        {
          email: data.email,
          name: data.name,
          role: data.role,
        }
      );
      toast.success('Invitation sent successfully');
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const handleResendInvite = async (user: User) => {
    try {
      await fetchData(
        pipe(getRoute('RESEND_INVITE_SYSTEM_USER'), { user_id: user.id }),
        'POST'
      );
      toast.success('Invitation resent successfully');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to resend invitation');
    }
  };

  const handleResetPassword = async (user: User) => {
    try {
      await fetchData(
        pipe(getRoute('RESET_PASSWORD_SYSTEM_USER'), { user_id: user.id }),
        'POST'
      );
      toast.success('Password reset link sent');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to reset password');
    }
  };

  const handleDeactivate = async (user: User) => {
    try {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      await fetchData(
        pipe(getRoute('UPDATE_SYSTEM_USER'), { user_id: user.id }),
        'PATCH',
        { status: newStatus }
      );
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to update user status');
    }
  };

  const handleDelete = async (user: User) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    try {
      await fetchData(
        pipe(getRoute('DELETE_SYSTEM_USER'), { user_id: user.id }),
        'DELETE'
      );
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to delete user');
    }
  };

  return (
    <PageTransition className="space-y-8">
      <PageHeader
        title="System Users"
        subtitle="Manage all users on the platform."
        action={
          <Button
            variant="brand"
            className="h-11 px-6 gap-2"
            onClick={() => setShowInviteDialog(true)}
          >
            <Plus size={16} />
            Invite User
          </Button>
        }
      />

      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <motion.div variants={itemVariants}>
          <StatCard icon={<Users />} label="Total Users" value={users.length.toString()} iconVariant="cobalt" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard icon={<Users />} label="Active Users" value={activeUsers.toString()} iconVariant="success" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard icon={<Users />} label="Pending Invites" value={invitedUsers.toString()} iconVariant="sky" />
        </motion.div>
      </motion.div>

      {error && (
        <motion.div
          variants={itemVariants}
          className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3"
        >
          <AlertCircle size={20} className="text-red-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 text-text-sm">{error}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchUsers}
              className="mt-2 text-red-600 hover:text-red-700"
            >
              Try Again
            </Button>
          </div>
        </motion.div>
      )}

      {/* Search */}
      <div className="bg-white rounded-2xl border-gradient shadow-sm p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-white border-gray-200 rounded-xl focus:ring-gp-sky/20 focus:border-gp-sky transition-all"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-16 text-gray-400 font-sans text-text-sm">
          <Loader2 className="animate-spin mx-auto mb-3" size={24} />
          Loading users…
        </div>
      ) : (
        <UserTable
          users={filteredUsers}
          isLoading={isLoading}
          onResendInvite={handleResendInvite}
          onResetPassword={handleResetPassword}
          onDeactivate={handleDeactivate}
          onDelete={handleDelete}
          onViewAudit={undefined}
        />
      )}

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
