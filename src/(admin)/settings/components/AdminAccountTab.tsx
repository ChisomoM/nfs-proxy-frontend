import React from 'react'
import { SectionCard } from '@/components/shared/SectionCard'

const AdminAccountTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <SectionCard title="Admin Account" onGrayBg>
        <div className="space-y-4">
          <p className="text-gray-600">Platform-level account settings for administrators.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Organization</label>
              <input
                className="w-full rounded-lg border border-gray-200 p-2"
                defaultValue="GeePay NFS"
                disabled
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Support Email</label>
              <input
                className="w-full rounded-lg border border-gray-200 p-2"
                defaultValue="support@geepay.example"
                disabled
              />
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}

export default AdminAccountTab
