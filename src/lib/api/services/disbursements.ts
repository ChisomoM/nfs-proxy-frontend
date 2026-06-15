import type {
  DisbursementField,
  DisbursementConfigResponse,
  BulkDisbursementPayload,
  BulkDisbursementResponse,
  BulkNameLookupItem,
  BulkNameLookupBatchResponse,
  BulkNameLookupStatusResponse,
  BulkTransferItem,
  BulkTransferResponse,
} from '@/types/disbursement';
import { DEFAULT_SCHEMA } from '@/lib/validations/disbursement';
import { retrieve, post } from '../crud';

export const DisbursementService = {
  async getConfig(): Promise<DisbursementField[]> {
    try {
      const response: DisbursementConfigResponse = await retrieve('DISBURSEMENT_CONFIG');
      if (response?.fields && response.fields.length > 0) return response.fields;
      return DEFAULT_SCHEMA;
    } catch {
      return DEFAULT_SCHEMA;
    }
  },

  async submit(payload: BulkDisbursementPayload): Promise<BulkDisbursementResponse> {
    return post('BULK_DISBURSE', payload);
  },
};

export const BulkNameLookupService = {
  async submit(items: BulkNameLookupItem[]): Promise<BulkNameLookupBatchResponse> {
    return post('BULK_NAME_LOOKUP', items);
  },
  async getStatus(batchId: string): Promise<BulkNameLookupStatusResponse> {
    return retrieve('BULK_NAME_LOOKUP_STATUS', { batchId });
  },
};

export const BulkFundTransferService = {
  async submit(items: BulkTransferItem[]): Promise<BulkTransferResponse> {
    return post('BULK_FUND_TRANSFER', items);
  },
};
