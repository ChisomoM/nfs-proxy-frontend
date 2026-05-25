import type { NormalizedEndpoint } from '../hooks/useOpenAPISpec';

export type CodeLanguage = 'curl' | 'javascript' | 'php' | 'go' | 'python';

interface CodeGeneratorRequest {
  method: string;
  path: string;
  baseUrl?: string;
  headers?: Record<string, string>;
  body?: Record<string, any>;
  query?: Record<string, string>;
}

export function generateCodeSnippet(
  language: CodeLanguage,
  request: CodeGeneratorRequest
): string {
  const baseUrl = request.baseUrl || 'http://localhost:8080';
  const url = `${baseUrl}${request.path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...request.headers,
  };

  switch (language) {
    case 'curl':
      return generateCurl(request.method, url, headers, request.body);
    case 'javascript':
      return generateJavaScript(request.method, url, headers, request.body);
    case 'php':
      return generatePHP(request.method, url, headers, request.body);
    case 'go':
      return generateGo(request.method, url, headers, request.body);
    case 'python':
      return generatePython(request.method, url, headers, request.body);
    default:
      return '';
  }
}

function generateCurl(
  method: string,
  url: string,
  headers: Record<string, string>,
  body?: Record<string, any>
): string {
  let cmd = `curl -X ${method} "${url}"`;

  Object.entries(headers).forEach(([key, value]) => {
    cmd += ` \\\n  -H "${key}: ${value}"`;
  });

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    cmd += ` \\\n  -d '${JSON.stringify(body, null, 2)}'`;
  }

  return cmd;
}

function generateJavaScript(
  method: string,
  url: string,
  headers: Record<string, string>,
  body?: Record<string, any>
): string {
  const code = `const response = await fetch("${url}", {
  method: "${method}",
  headers: {
${Object.entries(headers)
  .map(([key, value]) => `    "${key}": "${value}"`)
  .join(',\n')}
  },${
    body && (method === 'POST' || method === 'PUT' || method === 'PATCH')
      ? `
  body: JSON.stringify(${JSON.stringify(body, null, 4).split('\n').join('\n    ')})`
      : ''
  }
});

const data = await response.json();
console.log(data);`;

  return code;
}

function generatePHP(
  method: string,
  url: string,
  headers: Record<string, string>,
  body?: Record<string, any>
): string {
  const code = `<?php
$url = "${url}";
$method = "${method}";
$headers = [
${Object.entries(headers)
  .map(([key, value]) => `    "${key}: ${value}"`)
  .join(',\n')}
];${
    body && (method === 'POST' || method === 'PUT' || method === 'PATCH')
      ? `
$body = json_encode(${JSON.stringify(body, null, 4)});`
      : ''
  }

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);${
    body && (method === 'POST' || method === 'PUT' || method === 'PATCH')
      ? `
curl_setopt($ch, CURLOPT_POSTFIELDS, $body);`
      : ''
  }

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$data = json_decode($response, true);
var_dump($data);
?>`;

  return code;
}

function generateGo(
  method: string,
  url: string,
  headers: Record<string, string>,
  body?: Record<string, any>
): string {
  const code = `package main

import (
  "bytes"
  "encoding/json"
  "fmt"
  "io"
  "net/http"
)

func main() {
  url := "${url}"
  method := "${method}"${
    body && (method === 'POST' || method === 'PUT' || method === 'PATCH')
      ? `

  payload := map[string]interface{}{
${Object.entries(body || {})
  .map(([key, value]) => `    "${key}": ${JSON.stringify(value)}`)
  .join(',\n')}
  }

  jsonData, _ := json.Marshal(payload)
  req, _ := http.NewRequest(method, url, bytes.NewBuffer(jsonData))`
      : `

  req, _ := http.NewRequest(method, url, nil)`
  }

${Object.entries(headers)
  .map(([key, value]) => `  req.Header.Set("${key}", "${value}")`)
  .join('\n')}

  client := &http.Client{}
  resp, _ := client.Do(req)
  defer resp.Body.Close()

  body, _ := io.ReadAll(resp.Body)
  
  var result map[string]interface{}
  json.Unmarshal(body, &result)
  fmt.Println(result)
}`;

  return code;
}

function generatePython(
  method: string,
  url: string,
  headers: Record<string, string>,
  body?: Record<string, any>
): string {
  const code = `import requests
import json

url = "${url}"
method = "${method.upper()}"
headers = {
${Object.entries(headers)
  .map(([key, value]) => `    "${key}": "${value}"`)
  .join(',\n')}
}${
    body && (method === 'POST' || method === 'PUT' || method === 'PATCH')
      ? `

payload = ${JSON.stringify(body, null, 4)}`
      : ''
  }

response = requests.request(
  method,
  url,
  headers=headers${
    body && (method === 'POST' || method === 'PUT' || method === 'PATCH')
      ? `,
  json=payload`
      : ''
  }
)

data = response.json()
print(json.dumps(data, indent=2))`;

  return code;
}

export function generateFromEndpoint(
  language: CodeLanguage,
  endpoint: NormalizedEndpoint,
  authToken?: string
): string {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  // Generate example body from requestBody schema if available
  let exampleBody: Record<string, any> | undefined;
  if (endpoint.requestBody?.content?.['application/json']?.schema) {
    exampleBody = generateExampleFromSchema(
      endpoint.requestBody.content['application/json'].schema
    );
  }

  return generateCodeSnippet(language, {
    method: endpoint.method,
    path: endpoint.path,
    headers,
    body: exampleBody,
  });
}

function generateExampleFromSchema(schema: any): Record<string, any> {
  if (!schema) return {};

  const example: Record<string, any> = {};

  if (schema.properties) {
    Object.entries(schema.properties).forEach(([key, prop]: [string, any]) => {
      if (prop.type === 'string') {
        example[key] = prop.example || 'example_string';
      } else if (prop.type === 'number' || prop.type === 'integer') {
        example[key] = prop.example || 0;
      } else if (prop.type === 'boolean') {
        example[key] = prop.example ?? true;
      } else if (prop.type === 'array') {
        example[key] = [generateExampleFromSchema(prop.items || {})];
      } else if (prop.type === 'object') {
        example[key] = generateExampleFromSchema(prop);
      }
    });
  }

  return example;
}
