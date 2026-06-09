import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Loader2, AlertCircle, User as UserIcon,
  Mail, Phone, Shield, Clock, RotateCcw, Ban, Check, Lock,
} from 'lucide-react';
import { PageTransition } from '@/components/shared/PageTransition';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableHeaderRow, TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { fetchData } from '@/lib/api/crud';
import { getRoute, pipe } from '@/lib/api/end_points';
import type { User, PasswordResetEvent, UserStatus } from '@/types/auth';

const STATUS_COLORS: Record<string, string> = {
  active:    'bg-success-light text-success-fg',
  pending:   'bg-warning-light text-warning-fg',
  invited:   'bg-blue-50 text-blue-700',
  suspended: 'bg-amber-50 text-amber-700',
  locked:    'bg-red-50 text-red-700',
  inactive:  'bg-gray-100 text-gray-500',
};

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0">
    <span className="text-text-sm text-gray-500 font-medium min-w-36">{label}</span>
    <span className="text-text-sm text-gray-900 text-right">{value ?? '—'}</span>
  </div>
);

export const UserDetailPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [resetHistory, setResetHistory] = useState<PasswordResetEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

  const fetchUser = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchData('GET_SYSTEM_USER', 'GET', { user_id: userId });
      const data = res?.data ?? res;
      setUser(data);
    } catch {
      setError('Failed to load user');
      toast.error('Failed to load user');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const fetchResetHistory = useCallback(async () => {
    if (!userId) return;
    setHistoryLoading(true);
    try {
      const res = await fetchData('RESET_HISTORY_SYSTEM_USER', 'GET', { user_id: userId });
      const data = res?.data ?? res;
      setResetHistory(Array.isArray(data) ? data : []);
    } catch {
      setResetHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchUser(); }, [fetchUser]);
  useEffect(() => {
    if (activeTab === 'history') fetchResetHistory();
  }, [activeTab, fetchResetHistory]);

  const handleSetStatus = async (status: UserStatus) => {
    if (!userId) return;
    setIsSaving(true);
    try {
      await fetchData('SET_STATUS_SYSTEM_USER', 'PATCH', { user_id: userId }, { status });
      toast.success(`User ${status}`);
      fetchUser();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!userId) return;
    try {
      await fetchData('RESET_PASSWORD_SYSTEM_USER', 'POST', { user_id: userId });
      toast.success('Password reset email sent');
      if (activeTab === 'history') fetchResetHistory();
    } catch {
      toast.error('Failed to send password reset');
    }
  };

  const handleResendInvite = async () => {
    if (!userId) return;
    try {
      await fetchData('RESEND_INVITE_SYSTEM_USER', 'POST', { user_id: userId });
      toast.success('Invite resent');
    } catch {
      toast.error('Failed to resend invite');
    }
  };

  if (isLoading) {
    return (
      <PageTransition className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="animate-spin text-gp-cobalt" size={32} />
      </PageTransition>
    );
  }

  if (error || !user) {
    return (
      <PageTransition className="space-y-6">
        <BackButton onClick={() => navigate('/admin/users')} />
        <div className="rounded-2xl bg-white border-gradient shadow-sm p-12 text-center">
          <AlertCircle className="mx-auto mb-4 text-red-400" size={40} />
          <p className="text-gray-500 text-text-sm">{error || 'User not found'}</p>
          <Button variant="outline" className="mt-4" onClick={fetchUser}>Try Again</Button>
        </div>
      </PageTransition>
    );
  }

  const displayName = user.first_name && user.last_name
    ? `${user.first_name} ${user.last_name}`
    : user.name ?? user.email;

  const initials = displayName.substring(0, 2).toUpperCase();
  const statusColor = STATUS_COLORS[user.status] ?? STATUS_COLORS.inactive;

  return (
    <PageTransition className="space-y-6">
      <BackButton onClick={() => navigate('/admin/users')} />

      {/* Header card */}
      <div className="bg-white rounded-2xl border-gradient shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="h-16 w-16 rounded-2xl bg-gp-cobalt-light flex items-center justify-center text-gp-cobalt font-display font-bold text-display-xs flex-shrink-0">
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="font-display font-bold text-display-sm text-gray-900 truncate">{displayName}</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-text-xs font-semibold capitalize ${statusColor}`}>
              {user.status}
            </span>
            {user.is_staff && (
              <Badge variant="secondary" className="text-text-xs">Staff</Badge>
            )}
          </div>
          <p className="text-text-sm text-gray-500">{user.email}</p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 flex-shrink-0">
          {user.status === 'active' && (
            <Button variant="outline" size="sm" className="gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50"
              disabled={isSaving} onClick={() => handleSetStatus('suspended')}>
              <Ban size={14} /> Suspend
            </Button>
          )}
          {(user.status === 'suspended' || user.status === 'locked') && (
            <Button variant="outline" size="sm" className="gap-1.5 text-green-600 border-green-200 hover:bg-green-50"
              disabled={isSaving} onClick={() => handleSetStatus('active')}>
              <Check size={14} /> Activate
            </Button>
          )}
          {user.status === 'active' && (
            <Button variant="outline" size="sm" className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
              disabled={isSaving} onClick={() => handleSetStatus('locked')}>
              <Lock size={14} /> Lock
            </Button>
          )}
          {(user.status === 'pending' || user.status === 'invited') && (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleResendInvite}>
              <Mail size={14} /> Resend Invite
            </Button>
          )}
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleResetPassword}>
            <RotateCcw size={14} /> Reset Password
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="history">Reset History</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <div className="bg-white rounded-2xl border-gradient shadow-sm p-6">
            <h2 className="font-display font-semibold text-text-lg text-gray-900 mb-4">Account Information</h2>
            <InfoRow label="Full Name" value={displayName} />
            <InfoRow label="Email" value={
              <span className="flex items-center gap-1.5"><Mail size={13} className="text-gray-400" />{user.email}</span>
            } />
            <InfoRow label="Phone" value={
              user.last_login_at
                ? <span className="flex items-center gap-1.5"><Phone size={13} className="text-gray-400" />{(user as any).phone || '—'}</span>
                : '—'
            } />
            <InfoRow label="Role" value={
              <span className="bg-gray-50 px-2.5 py-1 rounded-lg text-text-sm font-medium">
                {user.role || 'Member'}
              </span>
            } />
            <InfoRow label="Account Type" value={
              <span className="flex items-center gap-1.5">
                <Shield size={13} className="text-gray-400" />
                {user.is_staff ? 'GeePay Staff' : 'Merchant User'}
              </span>
            } />
            <InfoRow label="Status" value={
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-text-xs font-semibold capitalize ${statusColor}`}>
                {user.status}
              </span>
            } />
            <InfoRow label="Last Login" value={
              user.last_login_at
                ? <span className="flex items-center gap-1.5">
                    <Clock size={13} className="text-gray-400" />
                    {new Date(user.last_login_at).toLocaleString()}
                  </span>
                : 'Never'
            } />
            <InfoRow label="Member Since" value={
              user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'
            } />
            {user.app_id && (
              <InfoRow label="App ID" value={
                <span className="font-mono text-text-xs text-gray-600">{user.app_id}</span>
              } />
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <div className="bg-white rounded-2xl border-gradient shadow-sm overflow-hidden">
            {historyLoading ? (
              <div className="text-center py-12 text-gray-400">
                <Loader2 className="animate-spin mx-auto mb-3" size={24} />
                Loading history…
              </div>
            ) : resetHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <RotateCcw size={36} className="mx-auto mb-3 opacity-30" />
                <p className="text-text-sm">No password reset events yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableHeaderRow>
                    <TableHead className="pl-6">Date</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Triggered By</TableHead>
                    <TableHead>Actor Type</TableHead>
                  </TableHeaderRow>
                </TableHeader>
                <TableBody>
                  {resetHistory.map((event) => (
                    <TableRow key={event.id} className="border-b border-gray-50">
                      <TableCell className="pl-6 text-text-sm text-gray-700">
                        {new Date(event.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-text-xs font-medium capitalize ${
                          event.method === 'admin_triggered'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}>
                          {event.method.replace('_', ' ')}
                        </span>
                      </TableCell>
                      <TableCell className="text-text-sm text-gray-600 font-mono">
                        {event.performed_by || '—'}
                      </TableCell>
                      <TableCell className="text-text-sm text-gray-500 capitalize">
                        {event.actor_type}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </PageTransition>
  );
};

const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <motion.button
    onClick={onClick}
    className="inline-flex items-center gap-2 font-sans text-text-sm font-medium text-gray-500 hover:text-gp-cobalt transition-colors duration-150"
    whileHover={{ x: -2 }}
    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
  >
    <ArrowLeft size={15} />
    Back to Users
  </motion.button>
);

export default UserDetailPage;
