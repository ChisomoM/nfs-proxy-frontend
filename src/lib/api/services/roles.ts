import { fetchData } from '../crud';

type Permissions = Record<string, string[]>;

export interface RoleModel {
  id: string;
  name: string;
  app_id?: string;
  is_global: boolean;
  created_at: string;
}

export const AdminRolesService = {
  async listRoles(): Promise<RoleModel[]> {
    const response = await fetchData('LIST_ROLES', 'GET', {}, null, { is_global: 'true' });
    return Array.isArray(response) ? response : [];
  },

  async getPermissions(): Promise<Permissions> {
    const response = await fetchData('GET_PERMISSIONS', 'GET', {}, null, { group: 'staff' });
    return (response as Permissions) ?? {};
  },

  async createRole(name: string, permissions: Permissions): Promise<void> {
    await fetchData('CREATE_ROLE', 'POST', {}, {
      name,
      is_global: true,
      permissions,
    });
  },

  async updateRole(id: string, name: string): Promise<void> {
    await fetchData('UPDATE_ROLE', 'PUT', { id }, { name });
  },

  async deleteRole(id: string): Promise<void> {
    await fetchData('DELETE_ROLE', 'DELETE', { id });
  },
};

export const MerchantRolesService = {
  async listRoles(): Promise<RoleModel[]> {
    const response = await fetchData('MERCHANT_LIST_ROLES', 'GET');
    return Array.isArray(response) ? response : [];
  },

  async getPermissions(): Promise<Permissions> {
    const response = await fetchData('GET_PERMISSIONS', 'GET', {}, null, { group: 'client' });
    return (response as Permissions) ?? {};
  },

  async createRole(name: string, permissions: Permissions): Promise<void> {
    await fetchData('MERCHANT_CREATE_ROLE', 'POST', {}, {
      name,
      is_global: false,
      permissions,
    });
  },

  async updateRole(id: string, name: string): Promise<void> {
    await fetchData('MERCHANT_UPDATE_ROLE', 'PUT', { id }, { name });
  },

  async deleteRole(id: string): Promise<void> {
    await fetchData('MERCHANT_DELETE_ROLE', 'DELETE', { id });
  },
};
