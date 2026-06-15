import { fetchData, fetchEnvelope } from '../crud';
import type { AuditTrail, AuditTrailsResponse } from '@/types/audit';

export const AuditService = {
  async listAdminTrails(query: Record<string, string> = {}): Promise<AuditTrailsResponse> {
    return fetchEnvelope('ADMIN_AUDIT_TRAILS', 'GET', {}, null, query);
  },

  async listMerchantTrails(query: Record<string, string> = {}): Promise<AuditTrailsResponse> {
    return fetchEnvelope('MERCHANT_AUDIT_TRAILS', 'GET', {}, null, query);
  },

  async listMerchantTrailsSimple(): Promise<AuditTrail[]> {
    const response = await fetchData('MERCHANT_AUDIT_TRAILS', 'GET');
    return Array.isArray(response) ? response : [];
  },

  async listAdminTrailsForMerchant(merchantId: string): Promise<AuditTrail[]> {
    const response = await fetchData('ADMIN_AUDIT_TRAILS', 'GET', {}, null, { merchant_id: merchantId });
    return Array.isArray(response) ? response : [];
  },

  async getAdminTrail(id: string): Promise<AuditTrail> {
    return fetchData('ADMIN_AUDIT_TRAIL', 'GET', { id });
  },

  async getMerchantTrail(id: string): Promise<AuditTrail> {
    return fetchData('MERCHANT_AUDIT_TRAIL', 'GET', { id });
  },
};
