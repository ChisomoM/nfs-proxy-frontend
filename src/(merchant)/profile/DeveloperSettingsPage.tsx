import { useState, useEffect } from 'react';
import { KeyIcon, Users } from 'lucide-react';
import { ApiKeyManager } from './api-keys/ApiKeyManager';
import { AppParticipantManager } from './api-keys/AppParticipantManager';
import { ProjectService } from '@/lib/api/services';
import { cn } from '@/lib/utils';

type Tab = 'api-keys' | 'participants';

export function DeveloperSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('api-keys');
  const [canonicalAppId, setCanonicalAppId] = useState<string | null>(null);

  // Fetch the canonical app ID once — needed only for the Participants tab
  useEffect(() => {
    ProjectService.getProjects().then(projects => {
      if (projects.length > 0) setCanonicalAppId(projects[0].id);
    }).catch(() => {});
  }, []);

  const tabs: { key: Tab; label: string; icon: typeof KeyIcon }[] = [
    { key: 'api-keys',     label: 'API Keys',    icon: KeyIcon },
    { key: 'participants', label: 'Participants', icon: Users   },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-display font-bold text-display-sm text-gray-900">Developer Settings</h1>
        <p className="font-sans text-text-sm text-gray-500 mt-1">
          Manage your API keys and payment network participants.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-text-sm font-medium transition-colors border-b-2 -mb-px',
              activeTab === key
                ? 'border-gp-cobalt text-gp-cobalt'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'api-keys' && (
        canonicalAppId
          ? <ApiKeyManager projectId={canonicalAppId} />
          : (
            <div className="text-center py-16 text-gray-400 font-sans text-text-sm">
              Loading API key settings…
            </div>
          )
      )}

      {activeTab === 'participants' && (
        canonicalAppId
          ? <AppParticipantManager projectId={canonicalAppId} />
          : (
            <div className="text-center py-16 text-gray-400 font-sans text-text-sm">
              Loading participant settings…
            </div>
          )
      )}
    </div>
  );
}
