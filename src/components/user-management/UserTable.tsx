import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableHeaderRow,
  TableRow,
  SortableTableHead,
} from '@/components/ui/table';
import { useTableSort } from '@/hooks/useTableSort';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Mail, Trash2, RotateCcw, Ban, Check, Users, ExternalLink } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import type { User } from '@/types/auth';



interface UserTableProps {
  users: User[];
  isLoading: boolean;
  onViewDetails?: (user: User) => void;
  onEdit?: (user: User) => void;
  onResendInvite?: (user: User) => void;
  onResetPassword?: (user: User) => void;
  onDeactivate?: (user: User) => void;
  onDelete?: (user: User) => void;
  onViewAudit?: (user: User) => void;
}

const TableSkeleton = () => {
  return Array.from({ length: 5 }).map((_, idx) => (
    <TableRow key={idx} className="border-b border-gray-50">
      <TableCell colSpan={6} className="py-4">
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
      </TableCell>
    </TableRow>
  ));
};

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'active':
      return 'success';
    case 'pending':
      return 'warning';
    case 'invited':
      return 'info';
    case 'inactive':
    default:
      return 'default';
  }
};

export const UserTable: React.FC<UserTableProps> = ({
  users,
  isLoading,
  onViewDetails,
  onEdit,
  onResendInvite,
  onResetPassword,
  onDeactivate,
  onDelete,
  onViewAudit,
}) => {
  const { sorted: sortedUsers, sortColumn, sortDirection, handleSort } = useTableSort(users);

  return (
    <div className="bg-white rounded-2xl border-gradient shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableHeaderRow>
              <SortableTableHead
                sortKey="name"
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                className="pl-6"
              >
                User
              </SortableTableHead>
              <SortableTableHead
                sortKey="email"
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
              >
                Email
              </SortableTableHead>
              <TableHead>Role</TableHead>
              <SortableTableHead
                sortKey="status"
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
              >
                Status
              </SortableTableHead>
              <SortableTableHead
                sortKey="last_login"
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
              >
                Last Login
              </SortableTableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableHeaderRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton />
            ) : sortedUsers.length > 0 ? (
              sortedUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className="group border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                >
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-gp-cobalt-light flex items-center justify-center text-gp-cobalt font-display font-bold text-text-xs">
                        {user.name?.substring(0, 2).toUpperCase() || '?'}
                      </div>
                      <span className="font-sans font-semibold text-text-sm text-gray-900 group-hover:text-gp-cobalt transition-colors">
                        {user.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-text-sm text-gray-600">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <span className="text-text-sm text-gray-700 bg-gray-50 px-2.5 py-1 rounded-lg inline-block">
                      {user.role || 'Member'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={getStatusVariant(user.status)} label={user.status} />
                  </TableCell>
                  <TableCell className="text-text-sm text-gray-500">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString() : '—'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {onViewDetails && (
                          <DropdownMenuItem
                            onClick={() => onViewDetails(user)}
                            className="cursor-pointer flex items-center gap-2"
                          >
                            <ExternalLink size={14} />
                            <span className="text-xs">View Details</span>
                          </DropdownMenuItem>
                        )}
                        {onEdit && (
                          <>
                            <DropdownMenuItem
                              onClick={() => onEdit(user)}
                              className="cursor-pointer flex items-center gap-2"
                            >
                              <span className="text-xs">Edit</span>
                            </DropdownMenuItem>
                          </>
                        )}
                        {onResendInvite && user.status === 'invited' && (
                          <>
                            <DropdownMenuItem
                              onClick={() => onResendInvite(user)}
                              className="cursor-pointer flex items-center gap-2"
                            >
                              <Mail size={14} />
                              <span className="text-xs">Resend Invite</span>
                            </DropdownMenuItem>
                          </>
                        )}
                        {onResetPassword && (
                          <>
                            <DropdownMenuItem
                              onClick={() => onResetPassword(user)}
                              className="cursor-pointer flex items-center gap-2"
                            >
                              <RotateCcw size={14} />
                              <span className="text-xs">Reset Password</span>
                            </DropdownMenuItem>
                          </>
                        )}
                        {onViewAudit && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onViewAudit(user)}
                              className="cursor-pointer flex items-center gap-2"
                            >
                              <span className="text-xs">View Audit Logs</span>
                            </DropdownMenuItem>
                          </>
                        )}
                        {(onDeactivate || onDelete) && (
                          <>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        {onDeactivate && user.status !== 'inactive' && (
                          <DropdownMenuItem
                            onClick={() => onDeactivate(user)}
                            className="cursor-pointer flex items-center gap-2 text-amber-600"
                          >
                            <Ban size={14} />
                            <span className="text-xs">Deactivate</span>
                          </DropdownMenuItem>
                        )}
                        {onDeactivate && user.status === 'inactive' && (
                          <DropdownMenuItem
                            onClick={() => onDeactivate(user)}
                            className="cursor-pointer flex items-center gap-2 text-green-600"
                          >
                            <Check size={14} />
                            <span className="text-xs">Activate</span>
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem
                            onClick={() => onDelete(user)}
                            className="cursor-pointer flex items-center gap-2 text-red-600"
                          >
                            <Trash2 size={14} />
                            <span className="text-xs">Delete</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-12">
                  <div className="text-center text-gray-400 font-sans text-text-sm">
                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <Users size={20} className="text-gray-300" />
                    </div>
                    No users found
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
