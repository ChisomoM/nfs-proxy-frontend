export interface Webhook {
  id: string;
  name: string;
  url: string;
  app_id: string;
  events: string[];
  is_active: boolean;
  /** Used to verify the X-GeePay-Signature header on deliveries. */
  secret?: string;
  created_at: string;
  updated_at: string;
}

export interface WebhookInput {
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  app_id?: string;
}

export type DeliveryResult = 'success' | 'failed' | 'pending';

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  name: string;
  result: DeliveryResult;
  status_code?: number;
  attempts?: number;
  duration_ms?: number;
  /** Why a delivery failed: timeout, dns, connection_refused, tls, http_status, ... */
  error_class?: string;
  error?: string;
  response_body?: string;
  replayable: boolean;
  created_at: string;
  last_attempted_at?: string;
}

export interface WebhookTestResult {
  delivered: boolean;
  status_code: number;
  duration_ms: number;
  error_class?: string;
  error?: string;
  response_body?: string;
}
