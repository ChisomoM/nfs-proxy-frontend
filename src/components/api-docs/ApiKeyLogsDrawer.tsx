/**
 * Mock API Key Logs Drawer
 * Simplified mock version showing sample audit logs
 */

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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
import { Button } from '@/components/ui/button';
import { useTableSort } from '@/hooks/useTableSort';
import type { AuditLog } from '@/types/project';

interface ApiKeyLogsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeyId: string | null;
  apiKeyName: string;
}

// Mock audit logs
const mockLogs: AuditLog[] = [
  {
    id: 'log-1',
    action: 'API Key Created',
    user_email: 'user@example.com',
    verification_method: '2FA',
    ip_address: '192.168.1.1',
    timestamp: '2024-01-15T10:00:00Z',
    metadata: { environment: 'sandbox' }
  },
  {
    id: 'log-2',
    action: 'API Key Copied',
    user_email: 'user@example.com',
    verification_method: '2FA',
    ip_address: '192.168.1.1',
    timestamp: '2024-01-16T14:30:00Z',
    metadata: { copied_by: 'user@example.com' }
  },
  {
    id: 'log-3',
    action: 'API Key Paused',
    user_email: 'admin@example.com',
    verification_method: '2FA',
    ip_address: '192.168.1.2',
    timestamp: '2024-01-20T09:15:00Z',
    metadata: { reason: 'Security concern' }
  }
];

export const ApiKeyLogsDrawer: React.FC<ApiKeyLogsDrawerProps> = ({
  isOpen,
  onClose,
  apiKeyId,
  apiKeyName,
}) => {
  const rawLogs = apiKeyId ? mockLogs : [];
  const { sorted: logs, sortColumn, sortDirection, handleSort } = useTableSort(rawLogs);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:w-[800px]">
        <SheetHeader>
          <SheetTitle>Audit Logs - {apiKeyName}</SheetTitle>
          <SheetDescription>
            View all activities related to this API key
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {logs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableHeaderRow>
                  <SortableTableHead sortKey="action" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort}>Action</SortableTableHead>
                  <SortableTableHead sortKey="user_email" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort}>User</SortableTableHead>
                  <SortableTableHead sortKey="timestamp" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort}>Timestamp</SortableTableHead>
                  <TableHead>IP Address</TableHead>
                </TableHeaderRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.user_email}</TableCell>
                    <TableCell>
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>{log.ip_address}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No logs available for this API key
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={onClose}>Close</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};