/**
 * Mock Subscription Manager Component
 * Placeholder component showing mock subscription information
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SubscriptionManagerProps {
  projectId: string;
  onSubscriptionStatusChange?: (isSubscribed: boolean) => void;
}

export const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({
  projectId: _projectId,
  onSubscriptionStatusChange: _onSubscriptionStatusChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Subscription Status
          <Badge variant="secondary">Active</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Current Plan</p>
            <p className="font-medium">Pro Plan</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Monthly Usage</p>
            <p className="font-medium">2,450 / 10,000 API calls</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>API Calls</span>
            <span>24.5%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '24.5%' }}></div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Upgrade Plan
          </Button>
          <Button variant="outline" size="sm">
            View Billing
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};