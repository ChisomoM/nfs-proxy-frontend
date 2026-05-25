import React from 'react'
import { SectionCard } from '@/components/shared/SectionCard'

const AdminIntegrations: React.FC = () => {
  return (
    <div className="space-y-6">
      <SectionCard title="Global Integrations" onGrayBg>
        <div className="space-y-4">
          <p className="text-gray-600">Configure platform integrations (webhooks, external services).</p>
          <div className="bg-white rounded-lg p-4 border border-gray-100 text-gray-500">Integrations settings placeholder</div>
        </div>
      </SectionCard>
    </div>
  )
}

export default AdminIntegrations
