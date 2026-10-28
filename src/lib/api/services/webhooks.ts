import type {
  Webhook,
  WebhookInput,
  WebhookDelivery,
  WebhookTestResult,
} from '@/types/webhook';
import { list, retrieve, post, update, remove } from '../crud';

export const WebhookService = {
  async getEventNames(): Promise<string[]> {
    const res = await retrieve('MERCHANT_WEBHOOK_EVENTS');
    return res.events || [];
  },

  async list(appId?: string): Promise<Webhook[]> {
    const res = await list('MERCHANT_LIST_WEBHOOKS', {}, appId ? { app_id: appId } : {});
    return res.webhooks || [];
  },

  async create(input: WebhookInput): Promise<Webhook> {
    const res = await post('MERCHANT_CREATE_WEBHOOK', input);
    return res.webhook;
  },

  async update(id: string, input: Partial<WebhookInput>): Promise<Webhook> {
    const res = await update('MERCHANT_UPDATE_WEBHOOK', input, { id });
    return res.webhook;
  },

  async remove(id: string): Promise<void> {
    await remove('MERCHANT_DELETE_WEBHOOK', { id });
  },

  async test(id: string): Promise<WebhookTestResult> {
    return post('MERCHANT_TEST_WEBHOOK', {}, { id });
  },

  async deliveries(id: string): Promise<WebhookDelivery[]> {
    const res = await retrieve('MERCHANT_WEBHOOK_DELIVERIES', { id });
    return res.deliveries || [];
  },

  async replay(eventId: string): Promise<WebhookDelivery> {
    const res = await post('MERCHANT_REPLAY_DELIVERY', {}, { event_id: eventId });
    return res.delivery;
  },
};
