export interface AuditTrail {
  id: string;
  merchant_id: string;
  app_id?: string;
  actor_type: string;
  actor_id: string;
  actor_email: string;
  action: string;
  request?: string;
  response?: string;
  status: number;
  request_id: string;
  session_id?: string;
  ip: string;
  user_agent?: string;
  time_elapsed: number;
  created_at: string;
  updated_at: string;
}

export interface AuditTrailsResponse {
  data?: AuditTrail[];
  meta?: {
    total_pages?: number;
    count?: number;
    page?: number;
    size?: number;
  };
  error?: string;
}
