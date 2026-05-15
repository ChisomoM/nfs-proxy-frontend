/**
 * Transaction types for the NFS simulator and transaction history.
 * Mirrors the backend EmoneyRequest / EmoneyResponse structs.
 */

export type EmoneyTransactionType =
  | 'CashIn'
  | 'CashOut'
  | 'FundTransfer'
  | 'Inquiry'
  | 'NameLookup'
  | 'Reversal';

export interface EmoneyRequest {
  transactionType: EmoneyTransactionType;

  // Mock-builder fields (still used by Inquiry)
  amount?: number;
  sourceAccount?: string;
  destinationAccount?: string;
  stan?: string;
  rrn?: string;
  currency?: string;
  terminalId?: string;
  cardAcceptorId?: string;

  // CashIn / CashOut (real endpoints)
  participantId?: string;
  msisdn?: string;
  pan?: string;
  countryCode?: string;
  hash?: string;
  callbackUrl?: string;

  // FundTransfer (real endpoint, person-to-person)
  routingCode?: string;
  narration?: string;
  senderMsisdn?: string;
  senderPan?: string;
  senderName?: string;
  receiverMsisdn?: string;
  receiverPan?: string;
  receiverName?: string;

  // Reversal (real endpoint)
  externalRef?: string;
  reason?: string;
}

export interface EmoneyResponse {
  success: boolean;
  responseCode: string;
  rrn?: string;
  stan?: string;
  balance?: number;
  message?: string;
  rawMti?: string;
  // Populated on Name Lookup responses
  name?: string;
  address?: string;
}

export interface SimulatedTransaction {
  id: string;
  type: EmoneyTransactionType;
  request: EmoneyRequest;
  response: EmoneyResponse;
  timestamp: string;
  durationMs: number;
}

/** Merchant transaction as returned from GET /api/v1/merchants/transactions */
export interface MerchantTransaction {
  ext_id: string;
  app_id: string;
  status: 'pending' | 'success' | 'failed';
  type?: string;
  amount: number;
  direction: string;
  source_account?: string;
  destination_account?: string;
  source_institution?: string;
  destination_institution?: string;
  stan?: string;
  rrn?: string;
  mti?: string;
  local_date_time?: string;
  external_reference?: string;
  created_at: string;
  completed_at?: string;
}

/** Human-readable labels for each transaction type. */
export const TRANSACTION_TYPE_LABELS: Record<EmoneyTransactionType, string> = {
  CashIn:       'Cash In',
  CashOut:      'Cash Out',
  FundTransfer: 'Fund Transfer',
  Inquiry:      'Balance Inquiry',
  NameLookup:   'Name Lookup',
  Reversal:     'Reversal',
};

/** ISO 8583 DE 39 response code → human-readable meaning. */
export const RESPONSE_CODE_LABELS: Record<string, string> = {
  '00':  'Approved',
  '000': 'Approved',
  '01':  'Refer to card issuer',
  '03':  'Invalid merchant',
  '05':  'Do not honour',
  '12':  'Invalid transaction',
  '13':  'Invalid amount',
  '14':  'Invalid account number',
  '30':  'Format error',
  '51':  'Insufficient funds',
  '54':  'Expired card',
  '55':  'Invalid PIN',
  '57':  'Transaction not permitted',
  '58':  'Transaction not permitted to terminal',
  '65':  'Exceeds withdrawal limit',
  '91':  'Issuer unavailable',
  '92':  'Destination not reachable',
  '96':  'System malfunction',
};
