import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { NormalizedEndpoint } from '../hooks/useOpenAPISpec';
import { CodeSnippets } from './CodeSnippets';
import { RequestTester } from './RequestTester';

interface EndpointCardProps {
  endpoint: NormalizedEndpoint;
  authToken?: string;
  baseUrl?: string;
}

const methodColors: Record<string, string> = {
  GET: 'bg-blue-50 text-blue-700 border-blue-200',
  POST: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PUT: 'bg-amber-50 text-amber-700 border-amber-200',
  PATCH: 'bg-purple-50 text-purple-700 border-purple-200',
  DELETE: 'bg-red-50 text-red-700 border-red-200',
  HEAD: 'bg-gray-50 text-gray-700 border-gray-200',
  OPTIONS: 'bg-gray-50 text-gray-700 border-gray-200',
};

export function EndpointCard({ endpoint, authToken, baseUrl }: EndpointCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between gap-4 text-left"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <span
            className={`px-3 py-1.5 rounded font-mono text-sm font-semibold border flex-shrink-0 ${
              methodColors[endpoint.method] || methodColors.GET
            }`}
          >
            {endpoint.method}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-sm text-gray-600 truncate">{endpoint.path}</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{endpoint.summary}</p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
        )}
      </button>

      {/* Details */}
      {expanded && (
        <div className="border-t border-gray-200 px-6 py-6 bg-gray-50 space-y-6">
          {/* Description */}
          {endpoint.description && (
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Description</h4>
              <p className="text-sm text-gray-600">{endpoint.description}</p>
            </div>
          )}

          {/* Tags */}
          {endpoint.tags && endpoint.tags.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {endpoint.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 bg-gp-cobalt-100 text-gp-cobalt-700 rounded-full text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Parameters */}
          {endpoint.parameters && endpoint.parameters.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-3">Parameters</h4>
              <div className="space-y-2">
                {endpoint.parameters.map((param) => (
                  <div key={param.name} className="bg-white p-3 rounded border border-gray-200">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono text-gp-cobalt-700">{param.name}</code>
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                        {param.in}
                      </span>
                      {param.required && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                          required
                        </span>
                      )}
                    </div>
                    {param.description && (
                      <p className="text-xs text-gray-600 mt-1">{param.description}</p>
                    )}
                    {param.schema?.type && (
                      <p className="text-xs text-gray-500 mt-1">Type: {param.schema.type}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Request Body */}
          {endpoint.requestBody && (
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Request Body</h4>
              <div className="bg-white p-3 rounded border border-gray-200">
                {endpoint.requestBody.required && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded inline-block mb-2">
                    required
                  </span>
                )}
                <p className="text-xs text-gray-600">
                  Content-Type: application/json
                </p>
                {endpoint.requestBody.content?.['application/json']?.schema && (
                  <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                    <code>
                      {JSON.stringify(
                        endpoint.requestBody.content['application/json'].schema,
                        null,
                        2
                      )}
                    </code>
                  </pre>
                )}
              </div>
            </div>
          )}

          {/* Responses */}
          {endpoint.responses && Object.keys(endpoint.responses).length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-3">Responses</h4>
              <div className="space-y-2">
                {Object.entries(endpoint.responses).map(([status, response]: [string, any]) => (
                  <div key={status} className="bg-white p-3 rounded border border-gray-200">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                          status.startsWith('2')
                            ? 'bg-emerald-100 text-emerald-700'
                            : status.startsWith('4')
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {status}
                      </span>
                      <span className="text-xs text-gray-600">{response.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Code Snippets */}
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-3">Code Examples</h4>
            <CodeSnippets method={endpoint.method} path={endpoint.path} authToken={authToken} />
          </div>

          {/* Request Tester */}
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-3">Test Request</h4>
            <RequestTester endpoint={endpoint} authToken={authToken} baseUrl={baseUrl} />
          </div>
        </div>
      )}
    </div>
  );
}
