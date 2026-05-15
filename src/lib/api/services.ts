/**
 * Mock API Services
 * Provides mock implementations for project and environment services
 */

import type {
  Project,
  Environment,
  CreateProjectInput
} from '@/types/project';
import type { EmoneyRequest, EmoneyResponse } from '@/types/transaction';
import type { Participant, CreateParticipantInput } from '@/types/participant';
import type { Merchant } from '@/types/merchant';
import { list, retrieve, post, remove, update, fetchData } from './crud';

// Local storage keys
const DOC_OVERRIDES_KEY = 'geepay_api_docs_overrides';

// Mock Environments Data
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

// Mock Projects Data
let mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'E-commerce Platform',
    description: 'Online shopping platform with payment integration',
    environment: mockEnvironments[0], // Sandbox
    webhook_url: 'https://api.example.com/webhooks',
    company_id: 'comp-1',
    is_active: true,
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 'proj-2',
    name: 'Mobile App Backend',
    description: 'Backend services for mobile application',
    environment: mockEnvironments[1], // Production
    webhook_url: 'https://mobile-api.example.com/webhooks',
    company_id: 'comp-1',
    is_active: true,
    created_at: '2024-02-01T12:00:00Z',
    updated_at: '2024-02-05T14:20:00Z'
  },
  {
    id: 'proj-3',
    name: 'Data Analytics Dashboard',
    description: 'Real-time analytics and reporting dashboard',
    environment: mockEnvironments[2], // Staging
    webhook_url: 'https://analytics.example.com/webhooks',
    company_id: 'comp-1',
    is_active: false,
    created_at: '2024-03-01T09:15:00Z',
    updated_at: '2024-03-10T16:45:00Z'
  }
];

// Project Service
export const ProjectService = {
  // Get all projects
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

  // Get single project by ID
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

  // Create new project
  async createProject(input: CreateProjectInput): Promise<Project> {
    const response = await post("CREATE_PROJECT", {
      display_name: input.name,
      description: input.description || '',
      webhook_url: input.webhook_url || '',
      app_type: input.app_type || 'integration',
    });

    // Backend now returns { app, sandbox_key, production_key }
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

  // Delete project
  async deleteProject(id: string): Promise<void> {
    await remove("DELETE_PROJECT", { id });
  }
};

// API Key Service
export const ApiKeyService = {
  // List API keys for an app
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

  // Generate a new API key
  async generateApiKey(appId: string, environment: string): Promise<any> {
    const response = await post("GENERATE_API_KEY", { environment }, { app_id: appId });
    return {
      ...response.api_key,
      full_key: response.secret_key,
      warning: response.warning
    };
  },

  // Revoke an API key
  async revokeApiKey(appId: string, keyId: string): Promise<void> {
    await remove("REVOKE_API_KEY", { app_id: appId, key_id: keyId });
  },

  // Toggle API key active status
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

  // Request OTP for viewing key
  async requestOTP(appId: string, keyId: string, email: string): Promise<void> {
    await post("REQUEST_OTP_FOR_KEY", { email }, { app_id: appId, key_id: keyId });
  },

  // Verify OTP and return full key
  async verifyOTP(appId: string, keyId: string, otp: string): Promise<string> {
    const response = await post("VERIFY_OTP_FOR_KEY", { otp }, { app_id: appId, key_id: keyId });
    return response.secret_key;
  }
};

// Mock Environment Service
export const EnvironmentService = {
  // Get all environments
  async getEnvironments(): Promise<Environment[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...mockEnvironments];
  }
};

// API Documentation Service
export const ApiDocumentationService = {
  // Fetch the OpenAPI spec
  async fetchSwaggerSpec(): Promise<OpenApiSpec> {
    try {
      // In a real app, this would be a fetch to your backend
      // const response = await fetch('/api/v1/swagger.json');
      // return await response.json();
      
      // For now, return a placeholder spec
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

  // Get manual documentation overrides
  async getOverrides(): Promise<DocOverride[]> {
    const stored = localStorage.getItem(DOC_OVERRIDES_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  // Save a manual documentation override
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
const BACKEND_URL: string = (import.meta.env.VITE_BACKEND_URL as string) ?? '';

/**
 * SimulatorService — routes each transaction type to its real backend
 * endpoint, reshaping the flat form state into the nested JSON contracts the
 * Go handlers in /internal/api/v1/emoney expect. Inquiry has no real
 * endpoint (only the mock builder), so it still hits /api/v1/emoney.
 */
export const SimulatorService = {
  async send(
    payload: EmoneyRequest,
  ): Promise<{ response: EmoneyResponse; durationMs: number }> {
    switch (payload.transactionType) {
      case 'CashIn':       return sendCashIn(payload);
      case 'CashOut':      return sendCashOut(payload);
      case 'FundTransfer': return sendFundTransfer(payload);
      case 'NameLookup':   return sendNameLookup(payload);
      case 'Reversal':     return sendReversal(payload);
      case 'Inquiry':      return sendMock(payload);
      default:             return sendMock(payload);
    }
  },
};

// ─── HTTP helpers ────────────────────────────────────────────────────────────

function newReferenceId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `ref-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

interface PostOptions {
  referenceId?: boolean; // if true, attach X-Reference-Id header
}

/** Read the merchant JWT from localStorage — mirrors getAccessTokenFromStorage in crud.tsx. */
function getSimulatorToken(): string | null {
  try {
    const raw = localStorage.getItem('gp_auth_token');
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return parsed.token || parsed.access_token || null;
    } catch {
      return raw;
    }
  } catch {
    return null;
  }
}

async function postJSON<T = any>(
  url: string,
  body: unknown,
  opts: PostOptions = {},
): Promise<{ parsed: T; durationMs: number; ok: boolean; status: number }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (opts.referenceId) headers['X-Reference-Id'] = newReferenceId();
  const token = getSimulatorToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const start = performance.now();
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const durationMs = Math.round(performance.now() - start);

  let parsed: any = null;
  try {
    parsed = await res.json();
  } catch {
    // ignore — surface as error below if status is bad
  }

  if (!res.ok) {
    const msg =
      parsed?.error ?? parsed?.message ?? parsed?.details ?? `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return { parsed: parsed as T, durationMs, ok: res.ok, status: res.status };
}

/**
 * Real endpoints wrap responses in `common.Response { message, code, data: TransactionModel }`.
 * The transaction model carries rrn/stan/mti once the NFS round-trip lands.
 * We map this to the flat EmoneyResponse the UI already renders.
 */
function mapTransactionEnvelope(parsed: any): EmoneyResponse {
  const message: string | undefined = parsed?.message;
  const data = parsed?.data ?? {};
  const success = message === 'success' || message === 'reversed';

  return {
    success,
    responseCode: success ? '00' : message === 'pending' ? '00' : '05',
    rrn: data.rrn || undefined,
    stan: data.stan || undefined,
    rawMti: data.mti || undefined,
    message,
  };
}

// ─── Per-tab senders ─────────────────────────────────────────────────────────

async function sendMock(
  payload: EmoneyRequest,
): Promise<{ response: EmoneyResponse; durationMs: number }> {
  const { parsed, durationMs } = await postJSON(
    `${BACKEND_URL}api/v1/emoney`,
    payload,
  );
  const response: EmoneyResponse = parsed?.data ?? parsed;
  return { response, durationMs };
}

async function sendCashIn(
  payload: EmoneyRequest,
): Promise<{ response: EmoneyResponse; durationMs: number }> {
  const body = {
    participant_id: payload.participantId,
    details: pickDetail(payload.msisdn, payload.pan, payload.countryCode),
    hash: payload.hash ?? '',
    amount: payload.amount,
    terminal_id: payload.terminalId ?? '',
    callback_url: payload.callbackUrl ?? '',
  };
  const { parsed, durationMs } = await postJSON(
    `${BACKEND_URL}api/v1/merchants/emoney/cash-in`,
    body,
    { referenceId: true },
  );
  return { response: mapTransactionEnvelope(parsed), durationMs };
}

async function sendCashOut(
  payload: EmoneyRequest,
): Promise<{ response: EmoneyResponse; durationMs: number }> {
  const body = {
    participant_id: payload.participantId,
    details: pickDetail(payload.msisdn, payload.pan, payload.countryCode),
    hash: payload.hash ?? '',
    amount: payload.amount,
    terminal_id: payload.terminalId ?? '',
    callback_url: payload.callbackUrl ?? '',
  };
  const { parsed, durationMs } = await postJSON(
    `${BACKEND_URL}api/v1/merchants/emoney/cash-out`,
    body,
    { referenceId: true },
  );
  return { response: mapTransactionEnvelope(parsed), durationMs };
}

async function sendFundTransfer(
  payload: EmoneyRequest,
): Promise<{ response: EmoneyResponse; durationMs: number }> {
  // Note: backend struct field is "reciever" (sic) — must match exactly.
  // participant_id is the receiver's network/institution code (routing_code from the form).
  const body = {
    amount: payload.amount,
    sender: pickDetail(
      payload.senderMsisdn,
      payload.senderPan,
      payload.countryCode,
      payload.senderName,
    ),
    reciever: pickDetail(
      payload.receiverMsisdn,
      payload.receiverPan,
      payload.countryCode,
      payload.receiverName,
    ),
    participant_id: payload.routingCode,
    callback_url: payload.callbackUrl ?? '',
    narration: payload.narration ?? '',
  };
  const { parsed, durationMs } = await postJSON(
    `${BACKEND_URL}api/v1/merchants/emoney/fund-transfer`,
    body,
    { referenceId: true },
  );
  return { response: mapTransactionEnvelope(parsed), durationMs };
}

async function sendReversal(
  payload: EmoneyRequest,
): Promise<{ response: EmoneyResponse; durationMs: number }> {
  const body = {
    external_ref: payload.externalRef,
    reason: payload.reason ?? '',
  };
  const { parsed, durationMs } = await postJSON(
    `${BACKEND_URL}api/v1/merchants/emoney/reversal`,
    body,
  );
  return { response: mapTransactionEnvelope(parsed), durationMs };
}

async function sendNameLookup(
  payload: EmoneyRequest,
): Promise<{ response: EmoneyResponse; durationMs: number }> {
  const body = {
    participant_id: payload.participantId,
    msisdn: payload.msisdn,
    country_code: payload.countryCode,
  };
  const { parsed, durationMs } = await postJSON(
    `${BACKEND_URL}api/v1/merchants/emoney/name-lookup`,
    body,
  );

  const status = parsed?.status;
  const success = status === 0 || parsed?.message === 'success';
  const data = parsed?.data ?? {};
  return {
    response: {
      success,
      responseCode: success ? '00' : String(status ?? ''),
      message: parsed?.message,
      name: data.name,
      address: data.address,
    },
    durationMs,
  };
}

// Build a Detail object from optional msisdn/pan/country/name. Empty values are
// omitted entirely so the backend's required_without validator behaves correctly.
function pickDetail(
  msisdn?: string,
  pan?: string,
  countryCode?: string,
  name?: string,
): Record<string, string> {
  const out: Record<string, string> = {};
  if (msisdn?.trim())      out.msisdn = msisdn.trim();
  if (pan?.trim())         out.pan = pan.trim();
  if (countryCode?.trim()) out.country_code = countryCode.trim();
  if (name?.trim())        out.name = name.trim();
  return out;
}

// Participant Service (Admin)
export const ParticipantService = {
  // Get all participants
  async getParticipants(): Promise<Participant[]> {
    const response = await list("LIST_PARTICIPANTS");
    return response.map((p: any) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      participant_id: p.participant_id,
      logo: p.logo,
      is_active: p.is_active,
      created_at: p.created_at,
    }));
  },

  // Get single participant
  async getParticipant(id: string): Promise<Participant> {
    const p = await retrieve("GET_PARTICIPANT", { id });
    return {
      id: p.id,
      name: p.name,
      type: p.type,
      participant_id: p.participant_id,
      logo: p.logo,
      is_active: p.is_active,
      created_at: p.created_at,
    };
  },

  // Create participant
  async createParticipant(input: CreateParticipantInput): Promise<Participant> {
    const response = await post("CREATE_PARTICIPANT", input);
    return {
      id: response.id,
      name: response.name,
      type: response.type,
      participant_id: response.participant_id,
      logo: response.logo,
      is_active: response.is_active,
      created_at: response.created_at,
    };
  },

  // Update participant
  async updateParticipant(id: string, input: Partial<CreateParticipantInput>): Promise<Participant> {
    const response = await update("UPDATE_PARTICIPANT", input, { id });
    return {
      id: response.id,
      name: response.name,
      type: response.type,
      participant_id: response.participant_id,
      logo: response.logo,
      is_active: response.is_active,
      created_at: response.created_at,
    };
  },

  // Archive participant
  async archiveParticipant(id: string): Promise<void> {
    await remove("ARCHIVE_PARTICIPANT", { id });
  },
};

// Merchant Service (Admin)
export const MerchantService = {
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

// Disbursement Service (Merchant)
import type {
  DisbursementField,
  DisbursementConfigResponse,
  BulkDisbursementPayload,
  BulkDisbursementResponse,
  BulkNameLookupItem,
  BulkNameLookupResponse,
} from '@/types/disbursement'
import { DEFAULT_SCHEMA } from '@/lib/validations/disbursement'

export const DisbursementService = {
  async getConfig(): Promise<DisbursementField[]> {
    try {
      const response: DisbursementConfigResponse = await retrieve('DISBURSEMENT_CONFIG')
      if (response?.fields && response.fields.length > 0) return response.fields
      return DEFAULT_SCHEMA
    } catch {
      return DEFAULT_SCHEMA
    }
  },

  async submit(payload: BulkDisbursementPayload): Promise<BulkDisbursementResponse> {
    return post('BULK_DISBURSE', payload)
  },
}

// Name Lookup Service (Merchant)
export const BulkNameLookupService = {
  async verify(items: BulkNameLookupItem[]): Promise<BulkNameLookupResponse> {
    return post('BULK_NAME_LOOKUP', { items })
  },
}

// App Participant Service (Merchant)
export const AppParticipantService = {
  // List all active participants available system-wide
  async listAllParticipants(): Promise<Participant[]> {
    const response = await retrieve("LIST_AVAILABLE_PARTICIPANTS");
    return (response.participants || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      participant_id: p.participant_id,
      logo: p.logo,
      is_active: p.is_active,
      created_at: p.created_at,
    }));
  },

  // List participants for an app
  async listAppParticipants(appId: string): Promise<Participant[]> {
    const response = await retrieve("LIST_APP_PARTICIPANTS", { app_id: appId });
    return response.map((p: any) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      participant_id: p.participant_id,
      logo: p.logo,
      is_active: p.is_active,
      created_at: p.created_at,
    }));
  },

  // Add participant to app
  async addParticipant(appId: string, participantId: string): Promise<void> {
    await post("ADD_APP_PARTICIPANT", { participant_id: participantId }, { app_id: appId });
  },

  // Remove participant from app
  async removeParticipant(appId: string, participantId: string): Promise<void> {
    await remove("REMOVE_APP_PARTICIPANT", { app_id: appId, participant_id: participantId });
  },
};