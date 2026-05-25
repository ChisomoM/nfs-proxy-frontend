import React from 'react'
import { SectionCard } from '@/components/shared/SectionCard'

const AdminApiKeys: React.FC = () => {
  return (
    <div className="space-y-6">
      <SectionCard title="API Keys" onGrayBg>
        <div className="space-y-4">
          <p className="text-gray-600">Admin API key management will be implemented here.</p>
          <div className="bg-white rounded-lg p-4 border border-gray-100 text-gray-500">API key table placeholder</div>
        </div>
      </SectionCard>
    </div>
  )
}

export default AdminApiKeys
