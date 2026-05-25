import React from 'react'
import { SectionCard } from '@/components/shared/SectionCard'

const AdminSecurityTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <SectionCard title="Security" onGrayBg>
        <div className="space-y-4">
          <p className="text-gray-600">Admin-level security settings and policies.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Password Policy</label>
              <select className="w-full rounded-lg border border-gray-200 p-2">
                <option>Default (recommended)</option>
                <option>Strict</option>
                <option>Relaxed</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">2FA Enforcement</label>
              <div className="mt-2 text-sm text-gray-600">Not configured — implement admin controls here.</div>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}

export default AdminSecurityTab
