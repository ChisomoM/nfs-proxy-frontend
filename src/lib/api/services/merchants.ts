import type { Merchant } from '@/types/merchant';
import { list, retrieve, fetchData, post } from '../crud';

export const MerchantService = {
  async listMerchants(): Promise<any[]> {
    const data = await list('LIST_MERCHANTS');
    return data.merchants || [];
  },

  async listMerchantsLookup(): Promise<Record<string, string>> {
    const data = await list('LIST_MERCHANTS');
    const merchants = Array.isArray(data) ? data : (data?.merchants || []);
    const lookup: Record<string, string> = {};
    merchants.forEach((m: any) => {
      if (m.id) lookup[m.id] = m.business_name || m.id;
    });
    return lookup;
  },

  async createMerchant(input: {
    business_name: string;
    participant_id: string;
    contact_details: { email: string };
    create_participant: boolean;
  }): Promise<any> {
    return post('CREATE_MERCHANT', input);
  },

  async acceptInvite(inviteToken: string, password: string): Promise<void> {
    await post('ACCEPT_INVITE', { invite_token: inviteToken, password });
  },

  async getMerchant(id: string): Promise<Merchant> {
    const m = await retrieve("GET_MERCHANT", { id });
    const data = m.merchant ?? m;
    return {
      ext_id:          data.id ?? data.ext_id ?? id,
      business_name:   data.business_name,
      participant_id:  data.participant_id,
      status:          data.status ?? 'active',
      created_at:      data.created_at,
      contact_details: data.contact_details ?? {},
    };
  },

  async updateMerchantStatus(id: string, status: 'active' | 'suspended'): Promise<void> {
    await fetchData("UPDATE_MERCHANT", "PATCH", { id }, { status });
  },

  async updateMerchant(id: string, updates: { business_name?: string; contact_details?: any; is_active?: boolean }): Promise<Merchant> {
    const result = await fetchData("UPDATE_MERCHANT", "PATCH", { id }, updates);
    return result.merchant ?? result;
  },

  async deleteMerchant(id: string): Promise<void> {
    await fetchData("DELETE_MERCHANT", "DELETE", { id });
  },
};
