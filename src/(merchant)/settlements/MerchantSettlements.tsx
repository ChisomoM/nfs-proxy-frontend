import React from 'react';
import { Wallet } from 'lucide-react';
import { PageTransition } from '@/components/shared/PageTransition';
import { PageHeader } from '@/components/shared/PageHeader';
import { SectionCard } from '@/components/shared/SectionCard';
import { EmptyState } from '@/components/shared/EmptyState';

export const MerchantSettlements: React.FC = () => {
  return (
    <PageTransition className="space-y-8">
      <PageHeader
        title="Settlements"
        subtitle="Track funds settled to your bank account."
      />

      <SectionCard title="Settlement History" onGrayBg>
        <EmptyState
          icon={<Wallet size={24} />}
          title="No settlements yet"
          description="Settled funds will appear here once processed."
        />
      </SectionCard>
    </PageTransition>
  );
};
