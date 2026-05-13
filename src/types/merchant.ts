export interface Merchant {
  ext_id: string;
  business_name: string;
  participant_id: string;
  status: string;
  created_at: string;
  is_active?: boolean;
  is_deleted?: boolean;
  deleted_at?: string;
  contact_details?: {
    email?: string;
  };
}
