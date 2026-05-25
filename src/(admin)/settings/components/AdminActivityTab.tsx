import React from 'react'
import { SectionCard } from '@/components/shared/SectionCard'

const AdminActivityTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <SectionCard title="Activity & Audit Logs" onGrayBg>
        <div className="space-y-4">
          <p className="text-gray-600">Recent admin actions and audit trail will be displayed here.</p>
          <div className="bg-white rounded-lg p-4 border border-gray-100 text-gray-500">Audit log table placeholder</div>
        </div>
      </SectionCard>
    </div>
  )
}

export default AdminActivityTab
