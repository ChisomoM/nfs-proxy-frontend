import { useState } from 'react';
import { Play, StopCircle, AlertCircle, CheckCircle, Copy, Check } from 'lucide-react';
import type { NormalizedEndpoint } from '../hooks/useOpenAPISpec';
import JSONEditor from 'react-json-editor-ajrm';
import locale from 'react-json-editor-ajrm/locale/en';

interface RequestTesterProps {
  endpoint: NormalizedEndpoint;
  authToken?: string;
  baseUrl?: string;
}

interface FormParam {
  name: string;
  value: string;
  in: string;
}

interface TestResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: any;
  time: number;
}

export function RequestTester({ endpoint, authToken, baseUrl }: RequestTesterProps) {
  const [pathParams, setPathParams] = useState<FormParam[]>(
    endpoint.parameters?.filter((p) => p.in === 'path') || []
  );
  const [queryParams, setQueryParams] = useState<FormParam[]>(
    endpoint.parameters?.filter((p) => p.in === 'query') || []
  );
  const [requestBody, setRequestBody] = useState<any>({});
  const [response, setResponse] = useState<TestResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showBody, setShowBody] = useState(false);

  const baseUrlFinal = baseUrl || 'http://localhost:8080';

  const handleExecute = async () => {
    setLoading(true);
    setResponse(null);

    try {
      const startTime = performance.now();

      // Build URL with path params
      let url = `${baseUrlFinal}${endpoint.path}`;
      pathParams.forEach((param) => {
        url = url.replace(`{${param.name}}`, encodeURIComponent(param.value));
      });

      // Add query params
      const queryString = new URLSearchParams(
        queryParams.filter((p) => p.value).map((p) => [p.name, p.value])
      ).toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const fetchOptions: RequestInit = {
        method: endpoint.method,
        headers,
      };

      if (endpoint.method !== 'GET' && endpoint.method !== 'HEAD') {
        fetchOptions.body = JSON.stringify(requestBody);
      }

      const res = await fetch(url, fetchOptions);
      const endTime = performance.now();

      // Parse response
      let body: any;
      const contentType = res.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        body = await res.json();
      } else {
        body = await res.text();
      }

      const responseHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        body,
        time: endTime - startTime,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setResponse({
        status: 0,
        statusText: 'Network Error',
        headers: {},
        body: { error: message },
        time: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResponse = () => {
    navigator.clipboard.writeText(JSON.stringify(response?.body, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 bg-white p-4 rounded-lg border border-gray-200">
      <h4 className="font-semibold text-sm text-gray-700">Test Request</h4>

      {/* Path Parameters */}
      {pathParams.length > 0 && (
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            Path Parameters
          </label>
          <div className="space-y-2">
            {pathParams.map((param) => (
              <input
                key={param.name}
                type="text"
                placeholder={param.name}
                value={param.value}
                onChange={(e) =>
                  setPathParams(
                    pathParams.map((p) =>
                      p.name === param.name ? { ...p, value: e.target.value } : p
                    )
                  )
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded outline-none focus:ring-2 focus:ring-gp-sky-500"
              />
            ))}
          </div>
        </div>
      )}

      {/* Query Parameters */}
      {queryParams.length > 0 && (
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            Query Parameters
          </label>
          <div className="space-y-2">
            {queryParams.map((param) => (
              <input
                key={param.name}
                type="text"
                placeholder={param.name}
                value={param.value}
                onChange={(e) =>
                  setQueryParams(
                    queryParams.map((p) =>
                      p.name === param.name ? { ...p, value: e.target.value } : p
                    )
                  )
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded outline-none focus:ring-2 focus:ring-gp-sky-500"
              />
            ))}
          </div>
        </div>
      )}

      {/* Request Body Editor */}
      {endpoint.requestBody && (endpoint.method === 'POST' || endpoint.method === 'PUT' || endpoint.method === 'PATCH') && (
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            Request Body
          </label>
          <div className="border border-gray-200 rounded bg-gray-50 p-2">
            <JSONEditor
              id="json-editor"
              locale={locale}
              height={200}
              width="100%"
              display={true}
              onValueChange={(content: any) => {
                if (content.jsObject) {
                  setRequestBody(content.jsObject);
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Execute Button */}
      <button
        onClick={handleExecute}
        disabled={loading}
        className={`w-full px-4 py-2 rounded font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
          loading
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
            : 'bg-gp-sky-500 text-white hover:bg-gp-sky-600'
        }`}
      >
        {loading ? (
          <>
            <StopCircle className="w-4 h-4 animate-spin" />
            Executing...
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            Execute Request
          </>
        )}
      </button>

      {/* Response */}
      {response && (
        <div className="space-y-3 border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <h5 className="font-semibold text-sm text-gray-700">Response</h5>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">{response.time.toFixed(0)}ms</span>
              <span
                className={`px-2 py-1 text-xs font-mono font-semibold rounded ${
                  response.status === 0
                    ? 'bg-red-100 text-red-700'
                    : response.status >= 200 && response.status < 300
                      ? 'bg-emerald-100 text-emerald-700'
                      : response.status >= 400 && response.status < 500
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-red-100 text-red-700'
                }`}
              >
                {response.status > 0 ? response.status : 'ERROR'} {response.statusText}
              </span>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            {response.status === 0 ? (
              <AlertCircle className="w-5 h-5 text-red-600" />
            ) : response.status >= 200 && response.status < 300 ? (
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-orange-600" />
            )}
            <span className="text-sm text-gray-600">
              {response.status === 0
                ? response.body.error
                : `Request completed in ${response.time.toFixed(0)}ms`}
            </span>
          </div>

          {/* Response Headers */}
          {Object.keys(response.headers).length > 0 && (
            <div>
              <button
                onClick={() => setShowBody(!showBody)}
                className="text-xs font-semibold text-gp-cobalt-600 hover:text-gp-cobalt-700 mb-2"
              >
                {showBody ? '▼' : '▶'} Response Headers ({Object.keys(response.headers).length})
              </button>
              {showBody && (
                <div className="bg-gray-50 p-2 rounded text-xs space-y-1 max-h-40 overflow-y-auto">
                  {Object.entries(response.headers).map(([key, value]) => (
                    <div key={key} className="font-mono text-gray-600">
                      <span className="font-semibold">{key}:</span> {String(value)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Response Body */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-600">Response Body</label>
              <button
                onClick={handleCopyResponse}
                className="text-xs text-gp-sky-600 hover:text-gp-sky-700 flex items-center gap-1"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto max-h-64">
              <code>{JSON.stringify(response.body, null, 2)}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
