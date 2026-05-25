import React from 'react'
import { SectionCard } from '@/components/shared/SectionCard'

const AdminUsageTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <SectionCard title="Usage & Metrics" onGrayBg>
        <div className="space-y-4">
          <p className="text-gray-600">Platform usage metrics will be shown here.</p>
          <div className="bg-white rounded-lg p-6 border border-gray-100 text-gray-500">Charts / graphs placeholder</div>
        </div>
      </SectionCard>
    </div>
  )
}

export default AdminUsageTab
