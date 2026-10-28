import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Webhook as WebhookIcon,
  Plus,
  Pencil,
  Trash2,
  Send,
  History,
  Copy,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { WebhookService } from '@/lib/api/services';
import type {
  Webhook,
  WebhookDelivery,
  WebhookInput,
  WebhookTestResult,
} from '@/types/webhook';

interface WebhookSettingsProps {
  projectId?: string;
}

const EMPTY_FORM: WebhookInput = { name: '', url: '', events: [], is_active: true };

// Human wording for the failure classes the proxy records.
const ERROR_CLASS_LABELS: Record<string, string> = {
  timeout: 'Timed out',
  dns: 'Host not found',
  connection_refused: 'Connection refused',
  connection_reset: 'Connection dropped',
  tls: 'TLS / certificate error',
  blocked_host: 'Private address blocked',
  http_status: 'Non-2xx response',
  network_error: 'Network error',
};

const errorLabel = (cls?: string) => (cls ? ERROR_CLASS_LABELS[cls] || cls : '');

const errorMessage = (err: unknown, fallback: string) =>
  err instanceof Error && err.message ? err.message : fallback;

// "emoney.fund_transfer.request" -> "Fund transfer"
const eventTitle = (name: string) => {
  const parts = name.split('.');
  const mid = (parts[1] || name).replace(/_/g, ' ');
  return mid.charAt(0).toUpperCase() + mid.slice(1);
};
const isRequestEvent = (name: string) => name.endsWith('.request');

const Pill: React.FC<{ tone: 'ok' | 'bad' | 'wait' | 'muted'; children: React.ReactNode }> = ({
  tone,
  children,
}) => {
  const tones = {
    ok: 'bg-emerald-50 text-emerald-700',
    bad: 'bg-red-50 text-red-700',
    wait: 'bg-amber-50 text-amber-700',
    muted: 'bg-gray-100 text-gray-600',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 font-sans text-text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
};

const WebhookSettings: React.FC<WebhookSettingsProps> = ({ projectId }) => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [eventNames, setEventNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Webhook | null>(null);
  const [form, setForm] = useState<WebhookInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, WebhookTestResult>>({});

  const [deliveriesFor, setDeliveriesFor] = useState<Webhook | null>(null);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);
  const [replayingId, setReplayingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const [list, names] = await Promise.all([
        WebhookService.list(projectId),
        WebhookService.getEventNames(),
      ]);
      setWebhooks(list);
      setEventNames(names);
    } catch (err) {
      setLoadError(errorMessage(err, 'Failed to load webhooks'));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, events: eventNames.filter(isRequestEvent) });
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (wh: Webhook) => {
    setEditing(wh);
    setForm({ name: wh.name, url: wh.url, events: wh.events, is_active: wh.is_active });
    setFormError(null);
    setDialogOpen(true);
  };

  const toggleEvent = (name: string, on: boolean) =>
    setForm((f) => ({
      ...f,
      events: on ? [...f.events, name] : f.events.filter((e) => e !== name),
    }));

  const handleSave = async () => {
    if (!form.url.trim()) return setFormError('Enter the URL we should call.');
    if (form.events.length === 0) return setFormError('Select at least one event.');

    setSaving(true);
    setFormError(null);
    try {
      if (editing) {
        await WebhookService.update(editing.id, form);
        toast.success('Webhook updated');
      } else {
        await WebhookService.create({ ...form, app_id: projectId });
        toast.success('Webhook created');
      }
      setDialogOpen(false);
      await load();
    } catch (err) {
      setFormError(errorMessage(err, 'Failed to save webhook'));
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (wh: Webhook, active: boolean) => {
    setWebhooks((list) => list.map((w) => (w.id === wh.id ? { ...w, is_active: active } : w)));
    try {
      await WebhookService.update(wh.id, { is_active: active });
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to update webhook'));
      await load();
    }
  };

  const handleDelete = async (wh: Webhook) => {
    if (confirmDeleteId !== wh.id) {
      setConfirmDeleteId(wh.id);
      return;
    }
    try {
      await WebhookService.remove(wh.id);
      toast.success('Webhook deleted');
      setConfirmDeleteId(null);
      if (deliveriesFor?.id === wh.id) setDeliveriesFor(null);
      await load();
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to delete webhook'));
    }
  };

  const handleTest = async (wh: Webhook) => {
    setTestingId(wh.id);
    try {
      const result = await WebhookService.test(wh.id);
      setTestResults((r) => ({ ...r, [wh.id]: result }));
    } catch (err) {
      toast.error(errorMessage(err, 'Test failed to run'));
    } finally {
      setTestingId(null);
    }
  };

  const loadDeliveries = async (wh: Webhook) => {
    setLoadingDeliveries(true);
    try {
      setDeliveries(await WebhookService.deliveries(wh.id));
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to load deliveries'));
    } finally {
      setLoadingDeliveries(false);
    }
  };

  const openDeliveries = async (wh: Webhook) => {
    setDeliveriesFor(wh);
    setDeliveries([]);
    await loadDeliveries(wh);
  };

  const handleReplay = async (d: WebhookDelivery) => {
    setReplayingId(d.id);
    try {
      await WebhookService.replay(d.id);
      toast.success('Delivery re-sent');
    } catch (err) {
      toast.error(errorMessage(err, 'Replay failed'));
    } finally {
      setReplayingId(null);
      if (deliveriesFor) await loadDeliveries(deliveriesFor);
    }
  };

  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${what} copied`);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const requestEvents = eventNames.filter(isRequestEvent);
  const notificationEvents = eventNames.filter((n) => !isRequestEvent(n));

  return (
    <div className="space-y-6">
      <Card className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-100">
                <WebhookIcon size={20} className="text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Webhooks</CardTitle>
                <p className="font-sans text-text-xs text-gray-500 mt-1">
                  Add as many endpoints as you need. Each one receives only the events you choose.
                </p>
              </div>
            </div>
            <Button onClick={openCreate} disabled={loading || !!loadError} className="gap-2">
              <Plus size={16} />
              Add webhook
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="rounded-lg bg-gray-50 border border-gray-100 p-4 font-sans text-text-xs text-gray-600 space-y-1.5">
            <p>
              <span className="font-semibold text-gray-800">Request events</span> (for example
              “Fund transfer · request”) are sent while the payment network is waiting for an answer.
              Reply with HTTP 200 and JSON such as{' '}
              <code className="font-mono bg-white px-1 rounded">{'{"response_code":"000"}'}</code>.
            </p>
            <p>
              If webhooks are registered for an event and none of them answers with HTTP 200 within a
              few seconds, the request is <span className="font-semibold">declined</span> (code 911 on
              timeout, 912 otherwise).
            </p>
            <p>
              Every delivery is signed. Verify the <code className="font-mono">X-GeePay-Signature</code>{' '}
              header with your webhook’s signing secret.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-gray-400 font-sans text-text-sm">
              <Loader2 size={16} className="animate-spin" />
              Loading webhooks…
            </div>
          ) : loadError ? (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-red-100 bg-red-50 p-4 font-sans text-text-sm text-red-700">
              <span>{loadError}</span>
              <Button variant="outline" size="sm" onClick={load}>
                Retry
              </Button>
            </div>
          ) : webhooks.length === 0 ? (
            <div className="text-center py-12 font-sans text-text-sm text-gray-500">
              No webhooks yet. Until you add one, incoming requests are approved by default.
            </div>
          ) : (
            webhooks.map((wh) => {
              const test = testResults[wh.id];
              return (
                <div key={wh.id} className="rounded-xl border border-gray-100 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-sans text-text-md font-semibold text-gray-900">
                          {wh.name || 'Webhook'}
                        </span>
                        <Pill tone={wh.is_active ? 'ok' : 'muted'}>
                          {wh.is_active ? 'Active' : 'Paused'}
                        </Pill>
                      </div>
                      <p className="font-mono text-text-sm text-gray-700 truncate mt-1">{wh.url}</p>
                    </div>
                    <Switch
                      checked={wh.is_active}
                      onCheckedChange={(v) => handleToggle(wh, v)}
                      aria-label="Active"
                    />
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {wh.events.map((e) => (
                      <Pill key={e} tone={isRequestEvent(e) ? 'wait' : 'muted'}>
                        {eventTitle(e)} · {isRequestEvent(e) ? 'request' : 'response'}
                      </Pill>
                    ))}
                  </div>

                  {test && (
                    <div
                      className={`flex items-start gap-2 rounded-lg p-3 font-sans text-text-xs ${
                        test.delivered ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                      }`}
                    >
                      {test.delivered ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                      <div className="min-w-0">
                        {test.delivered ? (
                          <p>
                            Test delivered — your endpoint answered HTTP {test.status_code} in{' '}
                            {test.duration_ms} ms.
                          </p>
                        ) : (
                          <p>
                            Test failed — {errorLabel(test.error_class) || 'no response'}
                            {test.status_code ? ` (HTTP ${test.status_code})` : ''}
                            {test.error ? `: ${test.error}` : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => handleTest(wh)}
                      disabled={testingId === wh.id}
                    >
                      {testingId === wh.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Send size={14} />
                      )}
                      Send test
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => openDeliveries(wh)}
                    >
                      <History size={14} />
                      Deliveries
                    </Button>
                    {wh.secret && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => copy(wh.secret!, 'Signing secret')}
                      >
                        <Copy size={14} />
                        Copy signing secret
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => openEdit(wh)}
                    >
                      <Pencil size={14} />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`gap-1.5 ${
                        confirmDeleteId === wh.id ? 'border-red-300 text-red-700' : ''
                      }`}
                      onClick={() => handleDelete(wh)}
                      onBlur={() => setConfirmDeleteId(null)}
                    >
                      <Trash2 size={14} />
                      {confirmDeleteId === wh.id ? 'Click again to delete' : 'Delete'}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {deliveriesFor && (
        <Card className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-base font-semibold text-gray-900">
                Recent deliveries · {deliveriesFor.name || deliveriesFor.url}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => loadDeliveries(deliveriesFor)}
                  disabled={loadingDeliveries}
                >
                  <RefreshCw size={14} className={loadingDeliveries ? 'animate-spin' : ''} />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" onClick={() => setDeliveriesFor(null)}>
                  Close
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {loadingDeliveries && deliveries.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-8 text-gray-400 font-sans text-text-sm">
                <Loader2 size={16} className="animate-spin" />
                Loading…
              </div>
            ) : deliveries.length === 0 ? (
              <p className="text-center py-8 font-sans text-text-sm text-gray-500">
                Nothing has been sent to this webhook yet.
              </p>
            ) : (
              <div className="divide-y divide-gray-100">
                {deliveries.map((d) => (
                  <div key={d.id} className="py-3 flex items-start justify-between gap-4">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Pill tone={d.result === 'success' ? 'ok' : d.result === 'failed' ? 'bad' : 'wait'}>
                          {d.result}
                        </Pill>
                        <span className="font-mono text-text-xs text-gray-700">{d.name}</span>
                        {d.status_code ? (
                          <span className="font-sans text-text-xs text-gray-500">
                            HTTP {d.status_code}
                          </span>
                        ) : null}
                        {d.duration_ms !== undefined && d.duration_ms > 0 && (
                          <span className="font-sans text-text-xs text-gray-500">
                            {d.duration_ms} ms
                          </span>
                        )}
                      </div>
                      {d.result === 'failed' && (d.error_class || d.error) && (
                        <p className="font-sans text-text-xs text-red-700">
                          {errorLabel(d.error_class)}
                          {d.error ? ` — ${d.error}` : ''}
                        </p>
                      )}
                      {d.result === 'failed' && d.response_body && (
                        <p className="font-mono text-text-xs text-gray-500 truncate">
                          Response: {d.response_body}
                        </p>
                      )}
                      <p className="font-sans text-text-xs text-gray-400">
                        {new Date(d.created_at).toLocaleString()}
                      </p>
                    </div>
                    {d.replayable && d.result === 'failed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 shrink-0"
                        onClick={() => handleReplay(d)}
                        disabled={replayingId === d.id}
                      >
                        {replayingId === d.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <RefreshCw size={14} />
                        )}
                        Replay
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => !saving && setDialogOpen(open)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit webhook' : 'Add webhook'}</DialogTitle>
            <DialogDescription>
              We will POST JSON to this URL. It must be a public HTTPS address.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wh-name">Name</Label>
              <Input
                id="wh-name"
                placeholder="e.g. Wallet service"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wh-url">URL</Label>
              <Input
                id="wh-url"
                type="url"
                placeholder="https://your-api.example.com/webhook"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                disabled={saving}
              />
            </div>

            {[
              { title: 'Request events — need your answer', names: requestEvents },
              { title: 'Notifications — no answer needed', names: notificationEvents },
            ].map((group) => (
              <div key={group.title} className="space-y-2">
                <Label>{group.title}</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {group.names.map((name) => (
                    <label
                      key={name}
                      className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2 font-sans text-text-sm text-gray-700 cursor-pointer"
                    >
                      <Checkbox
                        checked={form.events.includes(name)}
                        onCheckedChange={(v) => toggleEvent(name, v === true)}
                        disabled={saving}
                      />
                      {eventTitle(name)}
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2">
              <Label htmlFor="wh-active">Active</Label>
              <Switch
                id="wh-active"
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
                disabled={saving}
              />
            </div>

            {formError && <p className="font-sans text-text-sm text-red-600">{formError}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {editing ? 'Save changes' : 'Create webhook'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WebhookSettings;
