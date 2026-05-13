import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical,
  Send,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Copy,
  Check,
  ArrowDownUp,
  HelpCircle,
  DollarSign,
  Repeat2,
  Search,
  ArrowRight,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageTransition } from '@/components/shared/PageTransition';
import { SimulatorService } from '@/lib/api/services';
import type {
  EmoneyTransactionType,
  EmoneyRequest,
  EmoneyResponse,
  SimulatedTransaction,
} from '@/types/transaction';
import {
  TRANSACTION_TYPE_LABELS,
  RESPONSE_CODE_LABELS,
} from '@/types/transaction';
import { cn } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────

const TX_TYPES: EmoneyTransactionType[] = [
  'CashIn',
  'CashOut',
  'FundTransfer',
  'Inquiry',
  'NameLookup',
  'Reversal',
];

const HISTORY_KEY = 'gp_simulator_history';
const MAX_HISTORY = 50;

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const typeIconMap: Record<EmoneyTransactionType, React.ReactNode> = {
  CashIn: <ArrowDownUp size={16} />,
  CashOut: <DollarSign size={16} />,
  FundTransfer: <ArrowRight size={16} />,
  Inquiry: <Search size={16} />,
  NameLookup: <Search size={16} />,
  Reversal: <Repeat2 size={16} />,
};

// ─── Field definitions per transaction type ───────────────────────────────────

interface FieldDef {
  key: keyof EmoneyRequest;
  label: string;
  placeholder: string;
  type?: 'text' | 'number';
  required?: boolean;
  hint?: string;
}

const FIELDS_BY_TYPE: Record<EmoneyTransactionType, FieldDef[]> = {
  // POST /api/v1/emoney/cash-in
  CashIn: [
    { key: 'participantId', label: 'Participant ID', placeholder: '000204', required: true, hint: 'Receiver participant / acquirer code' },
    { key: 'msisdn', label: 'MSISDN', placeholder: '979139100', required: true, hint: 'Receiver mobile number (or use PAN below)' },
    { key: 'amount', label: 'Amount', placeholder: '116.00', type: 'number', required: true, hint: 'Decimal currency amount, e.g. 116.00' },
    { key: 'hash', label: 'Hash', placeholder: 'sha256-hash-here', required: true, hint: 'Validation hash provided by issuer' },
    { key: 'pan', label: 'PAN', placeholder: '0002040977873166', hint: 'Use PAN if MSISDN unavailable' },
    { key: 'countryCode', label: 'Country Code', placeholder: '260', hint: '260 = Zambia' },
    { key: 'terminalId', label: 'Terminal ID', placeholder: 'TERM0001' },
    { key: 'callbackUrl', label: 'Callback URL', placeholder: 'https://example.com/webhook' },
  ],
  // POST /api/v1/emoney/cash-out
  CashOut: [
    { key: 'participantId', label: 'Participant ID', placeholder: '000204', required: true, hint: 'Receiver participant / acquirer code' },
    { key: 'msisdn', label: 'MSISDN', placeholder: '979139100', required: true, hint: 'Account holder mobile number (or use PAN below)' },
    { key: 'amount', label: 'Amount', placeholder: '40.00', type: 'number', required: true, hint: 'Decimal currency amount, e.g. 40.00' },
    { key: 'hash', label: 'Hash', placeholder: 'sha256-hash-here', required: true, hint: 'Validation hash provided by issuer' },
    { key: 'terminalId', label: 'Terminal ID', placeholder: 'TERM0001', required: true, hint: 'Required for cash-out' },
    { key: 'pan', label: 'PAN', placeholder: '0002040977873166', hint: 'Use PAN if MSISDN unavailable' },
    { key: 'countryCode', label: 'Country Code', placeholder: '260', hint: '260 = Zambia' },
    { key: 'callbackUrl', label: 'Callback URL', placeholder: 'https://example.com/webhook' },
  ],
  // POST /api/v1/emoney/person-to-person
  FundTransfer: [
    { key: 'routingCode', label: 'Routing Code', placeholder: '000204', required: true, hint: 'Receiver participant ID (routing_code)' },
    { key: 'amount', label: 'Amount', placeholder: '500.00', type: 'number', required: true, hint: 'Decimal currency amount, e.g. 500.00' },
    { key: 'senderMsisdn', label: 'Sender MSISDN', placeholder: '979139100', required: true, hint: 'Sender mobile number (or use Sender PAN)' },
    { key: 'receiverMsisdn', label: 'Receiver MSISDN', placeholder: '977873166', required: true, hint: 'Receiver mobile number (or use Receiver PAN)' },
    { key: 'senderName', label: 'Sender Name', placeholder: 'John Doe' },
    { key: 'senderPan', label: 'Sender PAN', placeholder: '0002061000631652' },
    { key: 'receiverName', label: 'Receiver Name', placeholder: 'Daisy Mombotwa' },
    { key: 'receiverPan', label: 'Receiver PAN', placeholder: '0002040977873166' },
    { key: 'countryCode', label: 'Country Code', placeholder: '260', hint: '260 = Zambia (applied to both parties)' },
    { key: 'narration', label: 'Narration', placeholder: 'Rent payment' },
    { key: 'callbackUrl', label: 'Callback URL', placeholder: 'https://example.com/webhook' },
  ],
  // POST /api/v1/emoney  (mock — no real /inquiry endpoint exists)
  Inquiry: [
    { key: 'sourceAccount', label: 'Account Number', placeholder: '0002061000631652', required: true, hint: 'Mock-only: queries the simulated balance' },
    { key: 'currency', label: 'Currency Code', placeholder: '967', hint: '967 = ZMW' },
  ],
  // POST /api/v1/emoney/name-lookup
  NameLookup: [
    { key: 'participantId', label: 'Participant ID', placeholder: '000204', required: true, hint: 'ZECHL participant / acquirer code' },
    { key: 'msisdn', label: 'MSISDN', placeholder: '979139100', required: true, hint: 'Mobile number without leading zero or country code' },
    { key: 'countryCode', label: 'Country Code', placeholder: '260', hint: '260 = Zambia' },
  ],
  // POST /api/v1/emoney/reversal
  Reversal: [
    { key: 'externalRef', label: 'External Reference', placeholder: 'ref-uuid-123', required: true, hint: 'X-Reference-Id used on the original transaction' },
    { key: 'reason', label: 'Reason', placeholder: 'Customer requested', hint: 'Free-text reversal reason' },
  ],
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ResponseCodeBadge({ code }: { code: string }) {
  const isApproved = code === '00' || code === '000';
  const meaning = RESPONSE_CODE_LABELS[code] || 'Unknown code';
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col gap-1"
    >
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-text-xs font-semibold w-fit',
          isApproved
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-red-100 text-red-700',
        )}
      >
        {isApproved ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
        {code}
      </span>
      <span className="text-text-xs text-gray-600 font-sans">{meaning}</span>
    </motion.div>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <motion.button
      onClick={copy}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 600, damping: 32 }}
      className="h-7 w-7 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-150"
    >
      {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
    </motion.button>
  );
}

function ActivityLogItem({ transaction }: { transaction: SimulatedTransaction }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center justify-between px-4 py-3 bg-white rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-150 text-text-xs"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          className={cn(
            'w-2.5 h-2.5 rounded-full flex-shrink-0',
            transaction.response.success ? 'bg-emerald-500' : 'bg-red-400',
          )}
        />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-gray-900">
            {TRANSACTION_TYPE_LABELS[transaction.type]}
          </p>
          <p className="text-gray-500 text-text-xs">
            {new Date(transaction.timestamp).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {transaction.request.amount && (
          <span className="font-mono text-gray-600 tabular-nums">
            K {(transaction.request.amount / 100).toFixed(2)}
          </span>
        )}
        <ResponseCodeBadge code={transaction.response.responseCode} />
        <span className="text-gray-400 font-mono text-text-xs">
          {transaction.durationMs}ms
        </span>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SimulatorPage() {
  // Form state
  const [txType, setTxType] = useState<EmoneyTransactionType>('CashIn');
  const [formValues, setFormValues] = useState<Partial<EmoneyRequest>>({
    currency: '967',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof EmoneyRequest, string>>>({});

  // Execution state
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<{
    response: EmoneyResponse;
    durationMs: number;
    txType: EmoneyTransactionType;
    request: EmoneyRequest;
  } | null>(null);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [rawExpanded, setRawExpanded] = useState(false);

  // History
  const [history, setHistory] = useState<SimulatedTransaction[]>(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Load projects (reserved for future project selector enhancement)
  // useEffect(() => {
  //   ProjectService.getProjects()
  //     .then(setProjects)
  //     .catch(() => setProjects([]));
  // }, []);

  // Persist history
  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
  }, [history]);

  // Reset form when type changes
  const handleTypeChange = useCallback((type: EmoneyTransactionType) => {
    setTxType(type);
    setFormValues({ currency: '967' });
    setFormErrors({});
    setRuntimeError(null);
  }, []);

  const handleFieldChange = (key: keyof EmoneyRequest, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: key === 'amount' ? (value === '' ? undefined : Number(value)) : value,
    }));
    if (formErrors[key]) {
      setFormErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const validate = (): boolean => {
    const fields = FIELDS_BY_TYPE[txType];
    const errors: Partial<Record<keyof EmoneyRequest, string>> = {};
    fields.forEach((f) => {
      if (f.required) {
        const val = formValues[f.key];
        if (val === undefined || val === null || String(val).trim() === '') {
          errors[f.key] = 'Required';
        }
      }
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);
    setRuntimeError(null);
    setRawExpanded(false);

    const payload: EmoneyRequest = {
      ...formValues,
      transactionType: txType,
    } as EmoneyRequest;

    try {
      const { response, durationMs } = await SimulatorService.send(payload);

      setLastResult({ response, durationMs, txType, request: payload });

      const entry: SimulatedTransaction = {
        id: crypto.randomUUID(),
        type: txType,
        request: payload,
        response,
        timestamp: new Date().toISOString(),
        durationMs,
      };
      setHistory((prev) => [entry, ...prev].slice(0, MAX_HISTORY));
    } catch (err: any) {
      setRuntimeError(err?.message ?? 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => setHistory([]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <PageTransition>
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* PAGE HEADER */}
          <header className="pt-2 pb-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-start justify-between"
            >
              <div className="flex-1">
                <h1 className="font-display font-bold text-display-sm text-gradient-brand mb-2">
                  Transaction Simulator
                </h1>
                <p className="font-sans text-text-sm text-gray-600">
                  Test NFS e-money transactions instantly. Inspect requests, responses, and full transaction logs.
                </p>
              </div>
              
              {/* Status & Project Selector */}
              <div className="flex items-center gap-3">
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 border border-emerald-200"
                >
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-emerald-500"
                  />
                  <span className="font-sans text-text-xs text-emerald-700 font-medium">
                    NFS Mock Active
                  </span>
                </motion.span>
              </div>
            </motion.div>
          </header>

          {/* TRANSACTION TYPE SELECTOR */}
          <div className="py-4 px-4 bg-white rounded-2xl mb-6">
            <div className="flex items-center gap-4">
              <p className="font-sans text-text-xs text-gray-500 font-medium uppercase tracking-wider flex-shrink-0">
                Transaction Type
              </p>
              <motion.div className="flex bg-slate-50/80 p-1 rounded-xl gap-0.5">
                {TX_TYPES.map((type) => (
                  <motion.button
                    key={type}
                    onClick={() => handleTypeChange(type)}
                    className={cn(
                      'relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-text-xs font-medium transition-colors duration-150 outline-none',
                      txType === type
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700',
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    {typeIconMap[type]}
                    <span>{TRANSACTION_TYPE_LABELS[type]}</span>
                  </motion.button>
                ))}
              </motion.div>
            </div>
          </div>

          {/* MAIN CONTENT: LEFT (FORM) + RIGHT (RESPONSE) */}
          <div className="grid grid-cols-[1fr_420px] gap-6  pb-6 min-h-[calc(100vh-320px)]">
            {/* LEFT: FORM PANEL */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-2xl border-gray-200 overflow-hidden flex flex-col"
            >
              <div className="flex-1 px-6 py-8 overflow-y-auto rounded-2xl space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-6"
                >
                  {/* Form title */}
                  <div>
                    <h2 className="font-display font-semibold text-text-xl text-gray-900">
                      {TRANSACTION_TYPE_LABELS[txType]}
                    </h2>
                    <p className="font-sans text-text-sm text-gray-500 mt-1">
                      Fill in the fields below
                    </p>
                  </div>

                  {/* Dynamic form fields */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={txType}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-6"
                    >
                      {/* Required fields */}
                      {FIELDS_BY_TYPE[txType].filter((f) => f.required).length > 0 && (
                        <div className="space-y-4">
                          {FIELDS_BY_TYPE[txType]
                            .filter((f) => f.required)
                            .map((field) => (
                              <motion.div
                                key={field.key}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35 }}
                                className="space-y-2"
                              >
                                <Label className="font-sans text-text-sm font-medium text-gray-900 flex items-center gap-1.5">
                                  {field.label}
                                  <span className="text-red-400">*</span>
                                </Label>
                                <Input
                                  type={field.type ?? 'text'}
                                  value={
                                    formValues[field.key] !== undefined
                                      ? String(formValues[field.key])
                                      : ''
                                  }
                                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                  placeholder={field.placeholder}
                                  className={cn(
                                    'h-11 bg-white border rounded-lg font-mono text-text-sm transition-colors',
                                    'hover:border-gray-300 focus-visible:ring-gp-sky focus-visible:border-gp-sky',
                                    formErrors[field.key]
                                      ? 'border-red-300 bg-red-50'
                                      : 'border-gray-200',
                                  )}
                                />
                                {formErrors[field.key] ? (
                                  <motion.p
                                    initial={{ opacity: 0, y: -2 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="font-sans text-text-xs text-red-500 flex items-center gap-1"
                                  >
                                    <XCircle size={12} />
                                    {formErrors[field.key]}
                                  </motion.p>
                                ) : field.hint ? (
                                  <p className="font-sans text-text-xs text-gray-500 flex items-center gap-1">
                                    <HelpCircle size={12} className="flex-shrink-0" />
                                    {field.hint}
                                  </p>
                                ) : null}
                              </motion.div>
                            ))}
                        </div>
                      )}

                      {/* Optional fields separator */}
                      {FIELDS_BY_TYPE[txType].filter((f) => !f.required).length > 0 && (
                        FIELDS_BY_TYPE[txType].filter((f) => f.required).length > 0 && (
                          <div className="h-px bg-gradient-to-r from-gray-200 to-transparent" />
                        )
                      )}

                      {/* Optional fields */}
                      {FIELDS_BY_TYPE[txType].filter((f) => !f.required).length > 0 && (
                        <div className="space-y-4">
                          {FIELDS_BY_TYPE[txType]
                            .filter((f) => !f.required)
                            .map((field) => (
                              <motion.div
                                key={field.key}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35 }}
                                className="space-y-2"
                              >
                                <Label className="font-sans text-text-sm font-medium text-gray-700">
                                  {field.label}
                                </Label>
                                <Input
                                  type={field.type ?? 'text'}
                                  value={
                                    formValues[field.key] !== undefined
                                      ? String(formValues[field.key])
                                      : ''
                                  }
                                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                  placeholder={field.placeholder}
                                  className="h-11 bg-white border border-gray-200 rounded-lg font-mono text-text-sm transition-colors hover:border-gray-300 focus-visible:ring-gp-sky focus-visible:border-gp-sky"
                                />
                                {field.hint && (
                                  <p className="font-sans text-text-xs text-gray-500 flex items-center gap-1">
                                    <HelpCircle size={12} className="flex-shrink-0" />
                                    {field.hint}
                                  </p>
                                )}
                              </motion.div>
                            ))}
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Error banner */}
                  <AnimatePresence>
                    {runtimeError && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -8, height: 0 }}
                        className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3"
                      >
                        <XCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                        <p className="font-sans text-text-sm text-red-700">{runtimeError}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Sticky submit button */}
              <div className="px-6 py-6 border-t border-gray-100 bg-gray-50">
                <motion.button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="btn-gradient shimmer-surface w-full h-11 rounded-lg text-white font-sans font-semibold text-text-sm flex items-center justify-center gap-2.5 overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  whileHover={isLoading ? {} : { scale: 1.01 }}
                  whileTap={isLoading ? {} : { scale: 0.98 }}
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                      <span>Sending…</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Send Transaction</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>

            {/* RIGHT: RESPONSE PANEL */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="bg-white rounded-2xl overflow-hidden flex flex-col"
            >
              <div className="flex-1 px-6 py-8 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {!lastResult ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full flex flex-col items-center justify-center text-center"
                    >
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                        className="h-12 w-12 rounded-lg bg-gp-cobalt-100 flex items-center justify-center mb-4"
                      >
                        <FlaskConical size={24} className="text-gp-cobalt" />
                      </motion.div>
                      <p className="font-display font-semibold text-text-lg text-gray-900 mb-1">
                        Send a transaction
                      </p>
                      <p className="font-sans text-text-xs text-gray-500">
                        Response will appear here
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-5"
                    >
                      {/* Status icon & header */}
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {lastResult.response.success ? (
                          <div className="flex items-start gap-3">
                            <motion.div
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 0.5, repeat: 1 }}
                              className="flex-shrink-0 h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center"
                            >
                              <CheckCircle2 size={20} className="text-emerald-600" />
                            </motion.div>
                            <div>
                              <h3 className="font-display font-bold text-text-lg text-gray-900">
                                Approved
                              </h3>
                              <p className="font-sans text-text-xs text-gray-600 mt-0.5">
                                {TRANSACTION_TYPE_LABELS[lastResult.txType]} • {lastResult.durationMs}ms
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                              <XCircle size={20} className="text-red-600" />
                            </div>
                            <div>
                              <h3 className="font-display font-bold text-text-lg text-gray-900">
                                Declined
                              </h3>
                              <p className="font-sans text-text-xs text-gray-600 mt-0.5">
                                {TRANSACTION_TYPE_LABELS[lastResult.txType]} • {lastResult.durationMs}ms
                              </p>
                            </div>
                          </div>
                        )}
                      </motion.div>

                      {/* Response details */}
                      <div className="space-y-4 pt-2 border-t border-gray-100">
                        {/* Response Code */}
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <p className="font-sans text-text-xs text-gray-600 mb-2">Response Code</p>
                          <ResponseCodeBadge code={lastResult.response.responseCode} />
                        </motion.div>

                        {/* Server message (real endpoints surface pending / failed / reversed) */}
                        {lastResult.response.message && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.12 }}
                          >
                            <p className="font-sans text-text-xs text-gray-600 mb-2">Server Message</p>
                            <span className="font-mono text-text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg block capitalize">
                              {lastResult.response.message}
                            </span>
                          </motion.div>
                        )}

                        {/* RRN */}
                        {lastResult.response.rrn && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                          >
                            <p className="font-sans text-text-xs text-gray-600 mb-2">RRN</p>
                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                              <span className="font-mono text-text-sm font-medium text-gray-900 flex-1 truncate">
                                {lastResult.response.rrn}
                              </span>
                              <CopyButton value={lastResult.response.rrn} />
                            </div>
                          </motion.div>
                        )}

                        {/* STAN */}
                        {lastResult.response.stan && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <p className="font-sans text-text-xs text-gray-600 mb-2">STAN</p>
                            <span className="font-mono text-text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg block">
                              {lastResult.response.stan}
                            </span>
                          </motion.div>
                        )}

                        {/* Name (Name Lookup) */}
                        {lastResult.response.name && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <p className="font-sans text-text-xs text-gray-600 mb-2">Name</p>
                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                              <span className="font-display font-semibold text-text-base text-gray-900 flex-1 truncate">
                                {lastResult.response.name}
                              </span>
                              <CopyButton value={lastResult.response.name} />
                            </div>
                          </motion.div>
                        )}

                        {/* Address (Name Lookup) */}
                        {lastResult.response.address && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                          >
                            <p className="font-sans text-text-xs text-gray-600 mb-2">Address</p>
                            <span className="font-sans text-text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg block">
                              {lastResult.response.address}
                            </span>
                          </motion.div>
                        )}

                        {/* Balance */}
                        {lastResult.response.balance !== undefined && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                          >
                            <p className="font-sans text-text-xs text-gray-600 mb-2">Account Balance</p>
                            <span className="font-display font-bold text-display-xs text-gradient-stat tabular-nums block">
                              K {(lastResult.response.balance / 100).toFixed(2)}
                            </span>
                          </motion.div>
                        )}

                        {/* MTI */}
                        {lastResult.response.rawMti && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            <p className="font-sans text-text-xs text-gray-600 mb-2">MTI</p>
                            <span className="font-mono text-text-xs text-gray-700 bg-gray-50 px-3 py-2 rounded-lg block">
                              {lastResult.response.rawMti}
                            </span>
                          </motion.div>
                        )}
                      </div>

                      {/* Raw JSON toggle */}
                      <button
                        onClick={() => setRawExpanded((v) => !v)}
                        className="flex items-center gap-2 font-sans text-text-xs font-medium text-gp-sky hover:text-gp-cobalt transition-colors py-1 -mx-2 px-2"
                      >
                        {rawExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        {rawExpanded ? 'Hide' : 'View'} Raw JSON
                      </button>

                      {/* Raw JSON Panel */}
                      <AnimatePresence>
                        {rawExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden -mx-6 px-6"
                          >
                            <div className="relative bg-gray-900 rounded-lg p-3 overflow-x-auto border border-gray-700">
                              <pre className="text-emerald-400 text-[11px] font-mono leading-relaxed whitespace-pre-wrap break-words">
                                {JSON.stringify(lastResult.response, null, 2)}
                              </pre>
                              <div className="absolute top-2 right-2">
                                <CopyButton value={JSON.stringify(lastResult.response, null, 2)} />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* ACTIVITY LOG FOOTER */}
          {history.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.2 }}
              className="pb-6"
            >
              <div className="bg-white rounded-2xl border-gradient shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-semibold text-text-base text-gray-900">
                      Session Activity
                    </h3>
                    <span className="text-text-xs text-gray-500 font-medium">
                      {history.length} transaction{history.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto p-4 space-y-2">
                  {history.map((transaction) => (
                    <ActivityLogItem
                      key={transaction.id}
                      transaction={transaction}
                    />
                  ))}
                </div>

                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                  <motion.button
                    onClick={clearHistory}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2 text-text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw size={12} />
                    Clear Session History
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
