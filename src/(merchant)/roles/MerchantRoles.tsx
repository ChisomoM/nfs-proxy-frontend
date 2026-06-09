import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Loader2, AlertCircle, Shield, Trash2, Pencil, ChevronLeft } from 'lucide-react';
import { PageTransition } from '@/components/shared/PageTransition';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { fetchData } from '@/lib/api/crud';

interface RoleModel {
  id: string;
  name: string;
  app_id?: string;
  is_global: boolean;
  created_at: string;
}

type Permissions = Record<string, string[]>;

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

export const MerchantRoles: React.FC = () => {
  const [roles, setRoles] = useState<RoleModel[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<Permissions>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleModel | null>(null);
  const [roleName, setRoleName] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<Permissions>({});
  const [isSaving, setIsSaving] = useState(false);

  const fetchRoles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        fetchData('MERCHANT_LIST_ROLES', 'GET'),
        fetchData('GET_PERMISSIONS', 'GET', {}, null, { group: 'client' }),
      ]);
      setRoles(Array.isArray(rolesRes) ? rolesRes : []);
      setAvailablePermissions(permsRes ?? {});
    } catch (err: any) {
      setError('Failed to load roles');
      toast.error('Failed to load roles');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const openCreate = () => {
    setEditingRole(null);
    setRoleName('');
    setSelectedPerms({});
    setDialogOpen(true);
  };

  const openEdit = (role: RoleModel) => {
    setEditingRole(role);
    setRoleName(role.name);
    setSelectedPerms({});
    setDialogOpen(true);
  };

  const toggleAction = (resource: string, action: string) => {
    setSelectedPerms((prev) => {
      const current = prev[resource] ?? [];
      const next = current.includes(action)
        ? current.filter((a) => a !== action)
        : [...current, action];
      return { ...prev, [resource]: next };
    });
  };

  const handleSave = async () => {
    if (!roleName.trim()) {
      toast.error('Role name is required');
      return;
    }
setIsSaving(true);
    try {
      if (editingRole) {
        await fetchData('MERCHANT_UPDATE_ROLE', 'PUT', { id: editingRole.id }, { name: roleName });
        toast.success('Role updated');
      } else {
        await fetchData('MERCHANT_CREATE_ROLE', 'POST', {}, {
          name: roleName,
          is_global: false,
          permissions: selectedPerms,
        });
        toast.success('Role created');
      }
      setDialogOpen(false);
      fetchRoles();
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to save role');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (role: RoleModel) => {
    if (!window.confirm(`Delete role "${role.name}"? This cannot be undone.`)) return;
    try {
      await fetchData('MERCHANT_DELETE_ROLE', 'DELETE', { id: role.id });
      toast.success('Role deleted');
      fetchRoles();
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to delete role');
    }
  };

  return (
    <PageTransition className="space-y-8">
      <PageHeader
        title="Roles & Permissions"
        subtitle="Manage roles and permission sets for your team."
        action={
          <Button variant="brand" className="h-11 px-6 gap-2" onClick={openCreate}>
            <Plus size={16} />
            New Role
          </Button>
        }
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900 text-text-sm">{error}</p>
            <Button variant="ghost" size="sm" onClick={fetchRoles} className="mt-2 text-red-600">
              Try Again
            </Button>
          </div>
        </div>
      )}

      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border-gradient shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="text-center py-16 text-gray-400 font-sans text-text-sm">
              <Loader2 className="animate-spin mx-auto mb-3" size={24} />
              Loading roles…
            </div>
          ) : roles.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Shield size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-sans text-text-sm">No roles yet. Create one to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-semibold text-gray-900">{role.name}</TableCell>
                    <TableCell className="text-gray-500 text-text-sm">
                      {new Date(role.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(role)}>
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDelete(role)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </motion.div>
      </motion.div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl bg-white p-0 overflow-hidden border-none shadow-2xl">
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-200">
            <h2 className="font-display font-bold text-display-sm text-gray-900">
              {editingRole ? 'Edit Role' : 'Create Role'}
            </h2>
            <p className="font-sans text-text-sm text-gray-600 mt-1">
              {editingRole
                ? 'Update the name for this role.'
                : 'Define a new role and select its permissions.'}
            </p>
          </div>

          {/* Content */}
          <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={editingRole?.id ?? 'create'}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <Label htmlFor="role-name" className="font-semibold text-text-sm">
                    Role Name *
                  </Label>
                  <Input
                    id="role-name"
                    placeholder="e.g. Support Agent"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    className="mt-2 rounded-xl border-gray-200"
                  />
                </div>

                {!editingRole && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                    <p className="font-semibold">Permissions Override</p>
                    <p className="text-xs mt-1 text-blue-700">
                      Select the permissions this role should grant to members.
                    </p>
                  </div>
                )}

                {!editingRole && Object.keys(availablePermissions).length > 0 && (
                  <div className="space-y-6">
                    {Object.entries(availablePermissions)
                      .filter(([, actions]) => Array.isArray(actions) && actions.length > 0)
                      .map(([resource, actions]) => {
                        const allSelected = actions.every((a) => (selectedPerms[resource] ?? []).includes(a));
                        const selectedCount = (selectedPerms[resource] ?? []).length;
                        return (
                          <div key={resource}>
                            <div className="flex items-center justify-between gap-3 mb-3">
                              <div className="flex items-center gap-3">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                  {resource}
                                </p>
                                <span className="text-xs text-gray-400">
                                  {selectedCount} of {actions.length}
                                </span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs font-medium text-blue-600 hover:bg-blue-50"
                                onClick={() =>
                                  setSelectedPerms((prev) => ({
                                    ...prev,
                                    [resource]: allSelected ? [] : [...actions],
                                  }))
                                }
                              >
                                {allSelected ? 'Deselect All' : 'Select All'}
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-3 pl-2">
                              {actions.map((action) => (
                                <label key={action} className="flex items-start gap-2 text-sm cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={(selectedPerms[resource] ?? []).includes(action)}
                                    onChange={() => toggleAction(resource, action)}
                                    className="h-4 w-4 mt-0.5 flex-shrink-0"
                                  />
                                  <span className="text-gray-700 font-medium leading-tight capitalize">
                                    {action}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs text-blue-700">
                      💡 Tip: Permissions take effect immediately after the role is created.
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <DialogFooter className="flex gap-3 border-t border-gray-200 bg-gray-50 px-8 py-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving} className="h-11">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button variant="brand" onClick={handleSave} disabled={isSaving} className="h-11 gap-2">
              {isSaving && <Loader2 size={14} className="animate-spin" />}
              {editingRole ? 'Save Changes' : 'Create Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
};

export default MerchantRoles;
