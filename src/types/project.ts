/**
 * Project Management Types
 * Defines types for projects, API keys, environments, and related API responses
 */

// Environment types
export interface Environment {
  id: string;
  name: string;
  description: string;
  slug: string;
}

// API Key types
export type ApiKeyEnvironment = 'sandbox' | 'production' | 'development';

export interface ApiKey {
  id: string;
  name: string;
  description?: string;
  environment?: ApiKeyEnvironment; // Optional until backend supports it
  key_type?: 'sandbox' | 'production'; // New field
  masked_key?: string; // New field
  generated_at: string;
  expires_at: string;
  is_active: boolean;
  is_paused?: boolean; // New field
  pause_reason?: string; // New field
  permissions: string[];
  key_prefix?: string; // First 4 characters for display
  project_id?: string; // Project association
}

// API Key response after generation (includes the actual key)
export interface ApiKeyResponse extends ApiKey {
  api_key: string; // The actual secret key, only shown once
  sandbox_key?: string; // For project creation response
  production_key_id?: string;
  production_key_hint?: string;
  message?: string;
}

// Audit Log for API Keys
export interface AuditLog {
  id?: string;
  action: string;
  user_email?: string;
  verification_method?: string;
  ip_address?: string;
  timestamp: string;
  metadata?: string | Record<string, any>;
}

// Project types
export interface Project {
  id: string;
  name: string;
  description: string;
  webhook_url?: string;
  primary_environment: 'sandbox' | 'production';
  app_type?: 'integration' | 'test' | 'internal';
  merchant_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  api_key?: ApiKey; // Legacy single key support
  sandbox_key?: string; // Plaintext sandbox key returned once on creation
  production_key?: string; // Plaintext production key returned once on creation
  production_key_id?: string; // Initial response only
}

// Form data for creating/updating a project
export interface CreateProjectInput {
  name: string;
  description?: string;
  webhook_url?: string;
  app_type?: 'integration' | 'test' | 'internal';
}

// Form data for generating an API key
export interface GenerateApiKeyInput {
  name: string;
  description?: string;
  environment: ApiKeyEnvironment;
  permissions: string[];
}

// API response structure (generic wrapper)
export interface ApiResponse<T> {
  status: number;
  message: string;
  data?: T;
}

// Specific API responses
export type EnvironmentListResponse = ApiResponse<Environment[]>;
export type ProjectListResponse = ApiResponse<Project[]>;
export type ProjectDetailResponse = ApiResponse<Project>;
export type ApiKeyListResponse = ApiResponse<ApiKey[]>; // Returns array now
export type ApiKeyGenerateResponse = ApiResponse<ApiKeyResponse>;
export type ApiKeyValidationResponse = ApiResponse<{
  valid: boolean;
  company_id: string;
  company: string;
  project_id: string;
  project_name: string;
  environment_id: string;
  environment: string;
  sandbox: boolean;
  expires_at: string;
  permissions: string[];
}>;

export type AuditLogListResponse = ApiResponse<AuditLog[]>;

// Error response
export interface ApiErrorResponse {
  status: number;
  message: string;
}

// Component state types
export interface ProjectsState {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
}

export interface EnvironmentsState {
  environments: Environment[];
  isLoading: boolean;
  error: string | null;
}

export interface ApiKeysState {
  apiKeys: ApiKey[];
  isLoading: boolean;
  error: string | null;
}
