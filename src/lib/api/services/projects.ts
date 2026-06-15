import type {
  Project,
  Environment,
  CreateProjectInput
} from '@/types/project';
import type { OpenApiSpec, DocOverride } from '@/types/openapi';
import { list, retrieve, post, remove, fetchData } from '../crud';

const DOC_OVERRIDES_KEY = 'geepay_api_docs_overrides';

const mockEnvironments: Environment[] = [
  {
    id: 'env-1',
    name: 'Sandbox',
    description: 'Development and testing environment',
    slug: 'sandbox'
  },
  {
    id: 'env-2',
    name: 'Production',
    description: 'Live production environment',
    slug: 'production'
  },
  {
    id: 'env-3',
    name: 'Staging',
    description: 'Staging environment for pre-production testing',
    slug: 'staging'
  }
];

export const ProjectService = {
  async getProjects(): Promise<Project[]> {
    const response = await list("LIST_PROJECTS");
    const apps = response.apps || [];
    return apps.map((app: any) => ({
      id: app.ext_id || app.id,
      name: app.display_name,
      description: app.description || '',
      webhook_url: app.webhook_url || '',
      primary_environment: app.primary_environment || 'sandbox',
      app_type: app.app_type || 'integration',
      merchant_id: app.merchant_id,
      is_active: app.status === 'active',
      created_at: app.created_at,
      updated_at: app.updated_at
    }));
  },

  async getProject(id: string): Promise<Project> {
    const app = await retrieve("GET_PROJECT", { id });
    return {
      id: app.ext_id || app.id,
      name: app.display_name,
      description: app.description || '',
      webhook_url: app.webhook_url || '',
      primary_environment: app.primary_environment || 'sandbox',
      app_type: app.app_type || 'integration',
      merchant_id: app.merchant_id,
      is_active: app.status === 'active',
      created_at: app.created_at,
      updated_at: app.updated_at
    };
  },

  async createProject(input: CreateProjectInput): Promise<Project> {
    const response = await post("CREATE_PROJECT", {
      display_name: input.name,
      description: input.description || '',
      webhook_url: input.webhook_url || '',
      app_type: input.app_type || 'integration',
    });

    const app = response.app || response;

    return {
      id: app.ext_id || app.id,
      name: app.display_name,
      description: app.description || '',
      webhook_url: app.webhook_url || '',
      primary_environment: app.primary_environment || 'sandbox',
      app_type: app.app_type || 'integration',
      merchant_id: app.merchant_id,
      is_active: app.status === 'active',
      created_at: app.created_at,
      updated_at: app.updated_at,
      sandbox_key: response.sandbox_key,
      production_key: response.production_key,
    };
  },

  async updateProject(id: string, input: Partial<CreateProjectInput>): Promise<Project> {
    const response = await fetchData("UPDATE_PROJECT", "PUT", { id }, {
      display_name: input.name,
      description: input.description,
      webhook_url: input.webhook_url,
      app_type: input.app_type,
    });

    const app = response.app || response;

    return {
      id: app.ext_id || app.id,
      name: app.display_name,
      description: app.description || '',
      webhook_url: app.webhook_url || '',
      primary_environment: app.primary_environment || 'sandbox',
      app_type: app.app_type || 'integration',
      merchant_id: app.merchant_id,
      is_active: app.status === 'active',
      created_at: app.created_at,
      updated_at: app.updated_at,
    };
  },

  async deleteProject(id: string): Promise<void> {
    await remove("DELETE_PROJECT", { id });
  }
};

export const ApiKeyService = {
  async listApiKeys(appId: string): Promise<any[]> {
    const response = await retrieve("LIST_API_KEYS", { app_id: appId });
    const keys = response.api_keys || [];
    return keys.map((k: any) => ({
      id: k.id,
      name: `${k.environment.toUpperCase()} Key`,
      key_prefix: k.prefix,
      environment: k.environment,
      key_type: k.environment,
      generated_at: k.created_at,
      is_active: k.is_active,
      is_paused: !k.is_active,
    }));
  },

  async generateApiKey(appId: string, environment: string): Promise<any> {
    const response = await post("GENERATE_API_KEY", { environment }, { app_id: appId });
    return {
      ...response.api_key,
      full_key: response.secret_key,
      warning: response.warning
    };
  },

  async revokeApiKey(appId: string, keyId: string): Promise<void> {
    await remove("REVOKE_API_KEY", { app_id: appId, key_id: keyId });
  },

  async toggleApiKey(appId: string, keyId: string, isActive: boolean): Promise<any> {
    const response = await fetchData(
      "TOGGLE_API_KEY",
      "PATCH",
      { app_id: appId, key_id: keyId },
      { is_active: isActive }
    );
    return {
      id: response.ext_id || response.id,
      is_active: response.is_active,
      environment: response.environment,
    };
  },

  async requestOTP(appId: string, keyId: string, email: string): Promise<void> {
    await post("REQUEST_OTP_FOR_KEY", { email }, { app_id: appId, key_id: keyId });
  },

  async verifyOTP(appId: string, keyId: string, otp: string): Promise<string> {
    const response = await post("VERIFY_OTP_FOR_KEY", { otp }, { app_id: appId, key_id: keyId });
    return response.secret_key;
  }
};

export const EnvironmentService = {
  async getEnvironments(): Promise<Environment[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...mockEnvironments];
  }
};

export const ApiDocumentationService = {
  async fetchSwaggerSpec(): Promise<OpenApiSpec> {
    try {
      return {
        swagger: "2.0",
        info: {
          title: "GeePay NFS API",
          description: "API for GeePay NFS Proxy & Wallet Platform",
          version: "1.0.0"
        },
        host: "api.geepay.co.zm",
        basePath: "/api/v1",
        paths: {
          "/transactions": {
            "get": {
              "summary": "List transactions",
              "description": "Retrieve a paginated list of transactions.",
              "tags": ["Transactions"],
              "responses": {
                "200": { "description": "Success" }
              }
            }
          },
          "/float/balance": {
            "get": {
              "summary": "Get float balance",
              "description": "Retrieve the current float balance for the authenticated merchant.",
              "tags": ["Wallet"],
              "responses": {
                "200": { "description": "Success" }
              }
            }
          }
        }
      };
    } catch (error) {
      console.error('Failed to fetch swagger spec:', error);
      throw error;
    }
  },

  async getOverrides(): Promise<DocOverride[]> {
    const stored = localStorage.getItem(DOC_OVERRIDES_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  async saveOverride(override: DocOverride): Promise<void> {
    const overrides = await this.getOverrides();
    const index = overrides.findIndex(o => o.path === override.path && o.method === override.method);

    if (index >= 0) {
      overrides[index] = override;
    } else {
      overrides.push(override);
    }

    localStorage.setItem(DOC_OVERRIDES_KEY, JSON.stringify(overrides));
  }
};
