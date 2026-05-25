import React, { useState, useEffect } from 'react';
import { Users, Loader2 } from 'lucide-react';
import { AppParticipantManager } from '../profile/api-keys/AppParticipantManager';
import { ProjectService } from '@/lib/api/services';
import { PageTransition } from '@/components/shared/PageTransition';
import { PageHeader } from '@/components/shared/PageHeader';

export const MerchantParticipantsPage: React.FC = () => {
  const [canonicalAppId, setCanonicalAppId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const projects = await ProjectService.getProjects();
        if (projects.length > 0) setCanonicalAppId(projects[0].id);
        else {
          const created = await ProjectService.createProject({ name: 'Default', description: '', app_type: 'integration' });
          setCanonicalAppId(created.id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <PageTransition className="space-y-6">
      <PageHeader
        title="Participants"
        subtitle="Manage which banks, MNOs, and gateways your app can interact with."
        action={null}
      />

      {isLoading || !canonicalAppId ? (
        <div className="text-center py-16 text-gray-400 font-sans text-text-sm">
          <Loader2 className="animate-spin mx-auto mb-3" />
          Loading participant settings…
        </div>
      ) : (
        <AppParticipantManager projectId={canonicalAppId} />
      )}
    </PageTransition>
  );
};

export default MerchantParticipantsPage;
