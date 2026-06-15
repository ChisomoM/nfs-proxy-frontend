import { fetchData } from '../crud';
import type { User, UserStatus, PasswordResetEvent } from '@/types/auth';

function unwrapList<T>(response: unknown): T[] {
  const list = (response as { data?: T[] })?.data ?? response;
  return Array.isArray(list) ? list : [];
}

function unwrapOne<T>(response: unknown): T {
  return ((response as { data?: T })?.data ?? response) as T;
}

export const SystemUsersService = {
  async listStaff(query: Record<string, string> = {}): Promise<User[]> {
    const response = await fetchData('LIST_SYSTEM_USERS', 'GET', {}, null, query);
    return unwrapList<User>(response);
  },

  async listMerchantAdmins(query: Record<string, string> = {}): Promise<User[]> {
    const response = await fetchData('LIST_MERCHANT_ADMINS', 'GET', {}, null, query);
    return unwrapList<User>(response);
  },

  async invite(data: { email: string; name: string; role: string }): Promise<void> {
    await fetchData('INVITE_SYSTEM_USER', 'POST', {}, {
      email: data.email,
      name: data.name,
      role: data.role,
      is_staff: true,
    });
  },

  async setStatus(userId: string, status: UserStatus): Promise<void> {
    await fetchData('SET_STATUS_SYSTEM_USER', 'PATCH', { user_id: userId }, { status });
  },

  async updateMerchantAdminStatus(userId: string, status: UserStatus): Promise<void> {
    await fetchData('UPDATE_MERCHANT_USER', 'PATCH', { user_id: userId }, { status });
  },

  async resendInvite(userId: string): Promise<void> {
    await fetchData('RESEND_INVITE_SYSTEM_USER', 'POST', { user_id: userId });
  },

  async resendMerchantAdminInvite(userId: string): Promise<void> {
    await fetchData('RESEND_INVITE_MERCHANT_USER', 'POST', { user_id: userId });
  },

  async resetPassword(userId: string): Promise<void> {
    await fetchData('RESET_PASSWORD_SYSTEM_USER', 'POST', { user_id: userId });
  },

  async resetMerchantAdminPassword(userId: string): Promise<void> {
    await fetchData('RESET_PASSWORD_MERCHANT_USER', 'POST', { user_id: userId });
  },

  async delete(userId: string): Promise<void> {
    await fetchData('DELETE_SYSTEM_USER', 'DELETE', { user_id: userId });
  },

  async deleteMerchantAdmin(userId: string): Promise<void> {
    await fetchData('DELETE_MERCHANT_USER', 'DELETE', { user_id: userId });
  },

  async getUser(userId: string): Promise<User> {
    const response = await fetchData('GET_SYSTEM_USER', 'GET', { user_id: userId });
    return unwrapOne<User>(response);
  },

  async getResetHistory(userId: string): Promise<PasswordResetEvent[]> {
    const response = await fetchData('RESET_HISTORY_SYSTEM_USER', 'GET', { user_id: userId });
    return unwrapList<PasswordResetEvent>(response);
  },
};

export const MerchantUsersService = {
  async listUsers(): Promise<User[]> {
    const response = await fetchData('LIST_MERCHANT_USERS', 'GET');
    if (response && Array.isArray((response as { users?: User[] }).users)) {
      return (response as { users: User[] }).users;
    }
    if (Array.isArray(response)) {
      return response as User[];
    }
    return [];
  },

  async invite(data: { email: string; name: string; role: string }): Promise<void> {
    await fetchData('INVITE_MERCHANT_USER', 'POST', {}, data);
  },

  async resendInvite(userId: string): Promise<void> {
    await fetchData('RESEND_INVITE_MERCHANT_USER', 'POST', { user_id: userId });
  },

  async resetPassword(userId: string): Promise<void> {
    await fetchData('RESET_PASSWORD_MERCHANT_USER', 'POST', { user_id: userId });
  },

  async updateStatus(userId: string, status: string): Promise<void> {
    await fetchData('UPDATE_MERCHANT_USER', 'PATCH', { user_id: userId }, { status });
  },

  async delete(userId: string): Promise<void> {
    await fetchData('DELETE_MERCHANT_USER', 'DELETE', { user_id: userId });
  },
};
