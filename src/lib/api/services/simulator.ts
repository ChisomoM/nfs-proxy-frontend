import type { EmoneyRequest, EmoneyResponse } from '@/types/transaction';

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

  async checkTransactionStatus(
    externalRef: string,
  ): Promise<EmoneyResponse> {
    const token = getSimulatorToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(
      `${BACKEND_URL}merchants/transactions/${externalRef}`,
      { method: 'GET', headers },
    );

    let parsed: any = null;
    try {
      parsed = await res.json();
    } catch {}

    if (!res.ok) {
      const msg =
        parsed?.error ?? parsed?.message ?? `HTTP ${res.status}`;
      throw new Error(msg);
    }

    return mapTransactionEnvelope(parsed, res.status);
  },
};

// ─── HTTP helpers ────────────────────────────────────────────────────────────

function newReferenceId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `ref-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

interface PostOptions {
  referenceId?: boolean | string; // if true, generate and attach X-Reference-Id; if string, use that value
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
  if (opts.referenceId) {
    headers['X-Reference-Id'] = typeof opts.referenceId === 'string' ? opts.referenceId : newReferenceId();
  }
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
 * For 202 Accepted responses, also extract httpStatus, status, and externalReference.
 */
function mapTransactionEnvelope(parsed: any, httpStatus?: number): EmoneyResponse {
  const message: string | undefined = parsed?.message;
  const data = parsed?.data ?? {};
  const success = message === 'success' || message === 'reversed';
  const isPending = message?.toLowerCase().includes('pending');

  return {
    success,
    responseCode: success ? '00' : isPending ? '00' : '05',
    rrn: data.rrn || undefined,
    stan: data.stan || undefined,
    rawMti: data.mti || undefined,
    message,
    name: data.name || undefined,
    address: data.address || undefined,
    balance: data.balance !== undefined ? data.balance : undefined,
    httpStatus,
    status: data.status || (isPending ? 'pending' : undefined),
    externalReference: data.external_reference || data.id,
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
  const { parsed, durationMs, status } = await postJSON(
    `${BACKEND_URL}merchants/emoney/cash-in`,
    body,
    { referenceId: true },
  );
  return { response: mapTransactionEnvelope(parsed, status), durationMs };
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
  const { parsed, durationMs, status } = await postJSON(
    `${BACKEND_URL}merchants/emoney/cash-out`,
    body,
    { referenceId: true },
  );
  return { response: mapTransactionEnvelope(parsed, status), durationMs };
}

async function sendFundTransfer(
  payload: EmoneyRequest,
): Promise<{ response: EmoneyResponse; durationMs: number }> {
  // Note: backend struct field is "reciever" (sic) — must match exactly.
  // participant_id is the receiver's network/institution code.
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
    participant_id: payload.participantID,
    callback_url: payload.callbackUrl ?? '',
    narration: payload.narration ?? '',
  };
  const { parsed, durationMs, status } = await postJSON(
    `${BACKEND_URL}merchants/emoney/fund-transfer`,
    body,
    { referenceId: true },
  );
  return { response: mapTransactionEnvelope(parsed, status), durationMs };
}

async function sendReversal(
  payload: EmoneyRequest,
): Promise<{ response: EmoneyResponse; durationMs: number }> {
  const body = {
    external_ref: payload.externalRef,
    reason: payload.reason ?? '',
  };
  const { parsed, durationMs, status } = await postJSON(
    `${BACKEND_URL}merchants/emoney/reversal`,
    body,
  );
  return { response: mapTransactionEnvelope(parsed, status), durationMs };
}

async function sendNameLookup(
  payload: EmoneyRequest,
): Promise<{ response: EmoneyResponse; durationMs: number }> {
  const body = {
    participant_id: payload.participantId,
    msisdn: payload.msisdn,
    country_code: payload.countryCode,
  };
  const { parsed, durationMs, status } = await postJSON(
    `${BACKEND_URL}merchants/emoney/name-lookup`,
    body,
    { referenceId: true },
  );
  return { response: mapTransactionEnvelope(parsed, status), durationMs };
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
