export interface Participant {
  id: string;           // ext_id from backend
  name: string;
  type: 'mno' | 'bank' | 'gateway';
  participant_id: string;
  logo?: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateParticipantInput {
  name: string;
  type: string;
  participant_id: string;
  logo?: string;
}