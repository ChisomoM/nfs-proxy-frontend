import { fetchData } from '../crud';

export const TransactionService = {
  async listAdmin(): Promise<unknown[]> {
    const response = await fetchData('ADMIN_TRANSACTIONS', 'GET');
    return Array.isArray(response) ? response : [];
  },

  async listMerchant(): Promise<unknown[]> {
    const response = await fetchData('MERCHANT_TRANSACTIONS', 'GET');
    return Array.isArray(response) ? response : [];
  },
};
