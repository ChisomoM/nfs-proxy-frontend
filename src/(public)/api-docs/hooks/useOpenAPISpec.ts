import { useEffect, useState } from 'react';

export interface OpenAPIPath {
  path: string;
  method: string;
  summary: string;
  description?: string;
  tags?: string[];
  parameters?: Array<{
    name: string;
    in: string;
    required?: boolean;
    schema?: { type: string };
    description?: string;
  }>;
  requestBody?: {
    required?: boolean;
    content?: {
      'application/json'?: {
        schema?: any;
      };
    };
  };
  responses?: Record<string, any>;
  security?: Array<Record<string, string[]>>;
}

export interface OpenAPISpec {
  info: {
    title: string;
    version: string;
    description?: string;
    contact?: {
      name?: string;
      email?: string;
      url?: string;
    };
  };
  host: string;
  basePath: string;
  schemes: string[];
  paths: Record<string, Record<string, any>>;
  definitions?: Record<string, any>;
}

export interface NormalizedEndpoint {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  summary: string;
  description?: string;
  tags?: string[];
  parameters?: OpenAPIPath['parameters'];
  requestBody?: OpenAPIPath['requestBody'];
  responses?: Record<string, any>;
  security?: Array<Record<string, string[]>>;
}

const getApiSpecUrl = (): string => {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/';
  const trimmed = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${trimmed}docs/doc.json`;
};

const API_SPEC_URL = getApiSpecUrl();

export function useOpenAPISpec() {
  const [spec, setSpec] = useState<OpenAPISpec | null>(null);
  const [endpoints, setEndpoints] = useState<NormalizedEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpec = async () => {
      try {
        // Try localStorage cache first
        const cached = localStorage.getItem('openapi-spec-cache');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            setSpec(parsed);
            normalizeEndpoints(parsed);
            setLoading(false);
            return;
          } catch (e) {
            // Invalid cache, proceed with fetch
          }
        }

        const response = await fetch(API_SPEC_URL, {
          headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch spec: ${response.statusText}`);
        }

        const data: OpenAPISpec = await response.json();
        setSpec(data);
        localStorage.setItem('openapi-spec-cache', JSON.stringify(data));
        normalizeEndpoints(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load API specification';
        setError(message);
        console.error('OpenAPI spec fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSpec();
  }, []);

  const normalizeEndpoints = (spec: OpenAPISpec) => {
    const normalized: NormalizedEndpoint[] = [];

    Object.entries(spec.paths).forEach(([pathKey, pathItem]) => {
      Object.entries(pathItem).forEach(([method, operation]) => {
        if (
          method.toLowerCase() === 'parameters' ||
          method.toLowerCase() === '$ref'
        ) {
          return;
        }

        normalized.push({
          id: `${method.toUpperCase()}-${pathKey}`,
          path: pathKey,
          method: method.toUpperCase() as NormalizedEndpoint['method'],
          summary: operation.summary || 'No summary',
          description: operation.description,
          tags: operation.tags,
          parameters: operation.parameters,
          requestBody: operation.requestBody,
          responses: operation.responses,
          security: operation.security,
        });
      });
    });

    setEndpoints(normalized.sort((a, b) => a.path.localeCompare(b.path)));
  };

  return {
    spec,
    endpoints,
    loading,
    error,
  };
}
