/**
 * Mock Data for Projects Components
 * Provides mock data for API keys, validation, and other project-related data
 */

import type { ApiKey, ApiKeyValidationResponse } from '@/types/project';

// Re-export for convenience
export type { ApiKey, ApiKeyValidationResponse };

// Mock API Keys Data
export const mockApiKeys: ApiKey[] = [
  {
    id: 'key-1',
    name: 'Sandbox Key',
    description: 'Development sandbox API key',
    environment: 'sandbox',
    key_type: 'sandbox',
    masked_key: 'sk_sandbox_****1234',
    generated_at: '2024-01-15T10:00:00Z',
    expires_at: '2025-01-15T10:00:00Z',
    is_active: true,
    is_paused: false,
    permissions: ['read', 'write'],
    key_prefix: 'sk_sandbox_',
    project_id: 'proj-1'
  },
  {
    id: 'key-2',
    name: 'Production Key',
    description: 'Live production API key',
    environment: 'production',
    key_type: 'production',
    masked_key: 'sk_prod_****5678',
    generated_at: '2024-01-20T14:30:00Z',
    expires_at: '2025-01-20T14:30:00Z',
    is_active: true,
    is_paused: false,
    permissions: ['read', 'write', 'admin'],
    key_prefix: 'sk_prod_',
    project_id: 'proj-1'
  },
  {
    id: 'key-3',
    name: 'Development Key',
    description: 'Development environment key',
    environment: 'development',
    key_type: 'sandbox',
    masked_key: 'sk_dev_****9012',
    generated_at: '2024-02-01T09:15:00Z',
    expires_at: '2025-02-01T09:15:00Z',
    is_active: false,
    is_paused: true,
    pause_reason: 'Temporary suspension',
    permissions: ['read'],
    key_prefix: 'sk_dev_',
    project_id: 'proj-2'
  }
];

// Mock API Key Validation Function
export const mockValidateApiKey = (apiKey: string): ApiKeyValidationResponse['data'] => {
  // Simulate validation logic
  const validKeys: Record<string, ApiKeyValidationResponse['data']> = {
    'sk_sandbox_full1234': {
      valid: true,
      company_id: 'comp-1',
      company: 'Test Company',
      project_id: 'proj-1',
      project_name: 'Test Project',
      environment_id: 'env-1',
      environment: 'sandbox',
      sandbox: true,
      expires_at: '2025-01-15T10:00:00Z',
      permissions: ['read', 'write']
    },
    'sk_prod_full5678': {
      valid: true,
      company_id: 'comp-1',
      company: 'Test Company',
      project_id: 'proj-1',
      project_name: 'Test Project',
      environment_id: 'env-1',
      environment: 'production',
      sandbox: false,
      expires_at: '2025-01-20T14:30:00Z',
      permissions: ['read', 'write', 'admin']
    }
  };

  return validKeys[apiKey] || {
    valid: false,
    company_id: '',
    company: '',
    project_id: '',
    project_name: '',
    environment_id: '',
    environment: '',
    sandbox: false,
    expires_at: '',
    permissions: []
  };
};