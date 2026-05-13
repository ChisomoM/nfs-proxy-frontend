import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { PageTransition } from '@/components/shared/PageTransition';
import { PageHeader } from '@/components/shared/PageHeader';
import { SectionCard } from '@/components/shared/SectionCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { fetchData } from '@/lib/api/crud';
import { cn } from '@/lib/utils';
import type { AuditTrail } from '@/types/audit';
import type { StatusType } from '@/components/shared/StatusBadge';

interface AuditTrailDetailProps {
  scope: 'admin' | 'merchant';
}

const getStatusBadgeType = (status: number): StatusType => {
  if (status >= 200 && status < 300) return 'completed';
  if (status >= 300 && status < 500) return 'pending';
  return 'failed';
};

const formatTimestamp = (timestamp?: string): string => {
  if (!timestamp) return '-';
  return new Date(timestamp).toLocaleString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

const prettyBody = (body?: string): string => {
  if (!body) return 'No body captured.';
  try {
    return JSON.stringify(JSON.parse(body), null, 2);
  } catch {
    return body;
  }
};

const clientSummary = (userAgent?: string): string => {
  if (!userAgent) return 'Unknown client';
  const ua = userAgent.toLowerCase();
  const os = ua.includes('windows')
    ? 'Windows'
    : ua.includes('mac os')
      ? 'macOS'
      : ua.includes('android')
        ? 'Android'
        : ua.includes('iphone') || ua.includes('ipad')
          ? 'iOS'
          : ua.includes('linux')
            ? 'Linux'
            : 'Unknown OS';
  const browser = ua.includes('edg/')
    ? 'Edge'
    : ua.includes('chrome/')
      ? 'Chrome'
      : ua.includes('firefox/')
        ? 'Firefox'
        : ua.includes('safari/')
          ? 'Safari'
          : 'Unknown browser';
  const device = ua.includes('mobile') || ua.includes('iphone') || ua.includes('android')
    ? 'Mobile'
    : 'Desktop';

  return `${device} · ${browser} · ${os}`;
};

const Field: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div>
    <p className="font-sans text-text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
    <div className="mt-1 font-sans text-text-sm text-gray-800 break-words">{value || '-'}</div>
  </div>
);

export const AuditTrailDetail: React.FC<AuditTrailDetailProps> = ({ scope }) => {
  const { id } = useParams();
  const [trail, setTrail] = useState<AuditTrail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const listPath = scope === 'admin' ? '/admin/audit' : '/merchant/audit';
  const endpoint = scope === 'admin' ? 'ADMIN_AUDIT_TRAIL' : 'MERCHANT_AUDIT_TRAIL';

  useEffect(() => {
    const loadTrail = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const response = await fetchData(endpoint, 'GET', { id });
        setTrail(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load audit trail');
      } finally {
        setLoading(false);
      }
    };

    loadTrail();
  }, [endpoint, id]);

  const requestBody = useMemo(() => prettyBody(trail?.request), [trail?.request]);
  const responseBody = useMemo(() => prettyBody(trail?.response), [trail?.response]);

  return (
    <PageTransition className="space-y-8">
      <PageHeader
        title="Audit Event Details"
        subtitle="Full captured context for a single audit event."
        action={
          <Link
            to={listPath}
            className="h-10 rounded-xl border border-gray-200 bg-white px-4 font-sans text-text-sm font-semibold text-gray-700 inline-flex items-center gap-2 shadow-sm hover:bg-gray-50"
          >
            <ArrowLeft size={15} />
            Back
          </Link>
        }
      />

      {loading ? (
        <SectionCard title="Loading" onGrayBg>
          <p className="font-sans text-text-sm text-gray-500">Loading audit event...</p>
        </SectionCard>
      ) : error || !trail ? (
        <SectionCard title="Unable to Load" onGrayBg>
          <div className="flex items-center gap-3 text-danger-fg">
            <AlertCircle size={20} />
            <p className="font-sans text-text-sm">{error || 'Audit event not found.'}</p>
          </div>
        </SectionCard>
      ) : (
        <>
          <SectionCard title="Event Summary" onGrayBg>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <Field label="Action" value={<code className="font-mono text-text-xs">{trail.action}</code>} />
              <Field label="Status" value={<><StatusBadge status={getStatusBadgeType(trail.status)} /><span className="ml-2 font-mono text-text-xs text-gray-500">{trail.status}</span></>} />
              <Field label="Timestamp" value={formatTimestamp(trail.created_at)} />
              <Field label="Actor" value={trail.actor_email || trail.actor_id} />
              <Field label="Actor Type" value={trail.actor_type} />
              <Field label="Merchant ID" value={trail.merchant_id} />
              <Field label="Request ID" value={<code className="font-mono text-text-xs">{trail.request_id}</code>} />
              <Field label="Session ID" value={<code className="font-mono text-text-xs">{trail.session_id || '-'}</code>} />
              <Field label="Duration" value={`${Math.round(trail.time_elapsed * 1000)}ms`} />
            </div>
          </SectionCard>

          <SectionCard title="Client Context" onGrayBg>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <Field label="IP Address" value={<code className="font-mono text-text-xs">{trail.ip}</code>} />
              <Field label="Detected Client" value={clientSummary(trail.user_agent)} />
              <Field label="Raw User Agent" value={<code className="font-mono text-text-xs">{trail.user_agent || '-'}</code>} />
            </div>
          </SectionCard>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <SectionCard title="Request Body" onGrayBg contentClassName="p-0">
              <pre className={cn('max-h-[520px] overflow-auto p-5 font-mono text-xs leading-6 text-gray-700')}>
                {requestBody}
              </pre>
            </SectionCard>
            <SectionCard title="Response Body" onGrayBg contentClassName="p-0">
              <pre className={cn('max-h-[520px] overflow-auto p-5 font-mono text-xs leading-6 text-gray-700')}>
                {responseBody}
              </pre>
            </SectionCard>
          </div>
        </>
      )}
    </PageTransition>
  );
};
