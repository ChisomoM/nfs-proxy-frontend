/**
 * API Key Validator Component
 * Allows testing and validating API keys
 */

import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { mockValidateApiKey } from './mockData';
import type { ApiKeyValidationResponse } from './mockData';

export const ApiKeyValidator: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ApiKeyValidationResponse['data'] | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleValidate = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    setIsValidating(true);
    setValidationError(null);
    setValidationResult(null);

    try {
      const result = mockValidateApiKey(apiKey);
      setValidationResult(result);
      if (result && result.valid) {
        toast.success('API key is valid!');
      } else {
        setValidationError('API key is invalid or expired');
        toast.error('API key is invalid or expired');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to validate API key';
      setValidationError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsValidating(false);
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Validate API Key</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="apiKey">API Key</Label>
          <Input
            id="apiKey"
            type="password"
            placeholder="Paste your API key here"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            disabled={isValidating}
          />
          <p className="text-xs text-gray-500 mt-2">
            Test your API key to ensure it's active and has the correct permissions.
          </p>
        </div>

        <Button
          onClick={handleValidate}
          disabled={isValidating || !apiKey.trim()}
          className="w-full"
        >
          {isValidating ? 'Validating...' : 'Validate Key'}
        </Button>

        {/* Validation Error */}
        {validationError && !validationResult && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
            <p className="font-medium mb-1">❌ Validation Failed</p>
            <p>{validationError}</p>
          </div>
        )}

        {/* Validation Success */}
        {validationResult && validationResult.valid && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-green-600 text-lg">✓</span>
              <p className="font-medium text-green-900">Key is Valid</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium text-green-700 mb-1">Company</p>
                <p className="text-sm text-green-900">{validationResult.company}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-green-700 mb-1">Project</p>
                <p className="text-sm text-green-900">{validationResult.project_name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-green-700 mb-1">Environment</p>
                <p className="text-sm text-green-900">{validationResult.environment}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-green-700 mb-1">Expires</p>
                <p className="text-sm text-green-900">{formatDate(validationResult.expires_at)}</p>
              </div>
            </div>

            {validationResult.permissions && validationResult.permissions.length > 0 && (
              <div>
                <p className="text-xs font-medium text-green-700 mb-2">Permissions</p>
                <div className="flex flex-wrap gap-2">
                  {validationResult.permissions.map((perm) => (
                    <Badge key={perm} className="bg-green-200 text-green-800 text-xs">
                      {perm}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded px-2 py-1 text-xs text-blue-800">
              <p>
                {validationResult.sandbox
                  ? '🏗️ Sandbox Environment'
                  : '🚀 Production Environment'}
              </p>
            </div>
          </div>
        )}

        {/* Invalid Key Response */}
        {validationResult && !validationResult.valid && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm font-medium text-red-900">❌ Invalid API Key</p>
            <p className="text-xs text-red-800 mt-1">
              The API key is invalid, expired, or has been revoked.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
