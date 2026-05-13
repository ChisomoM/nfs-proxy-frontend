import { Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import { Toaster } from 'sonner';
import Login from './components/Login';
import { MerchantLoginPage } from './(merchant)/login/MerchantLoginPage';
import { AcceptInvitePage } from './(merchant)/login/AcceptInvitePage';
import { ProtectedRoute } from './lib/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import MerchantLayout from './layouts/MerchantLayout';
import { AdminDashboard } from './(admin)/admin/Admin';
import { MerchantsPage } from './(admin)/merchants/MerchantsPage';
import { MerchantDetailPage } from './(admin)/merchants/MerchantDetailPage';
import { ParticipantsPage } from './(admin)/participants/ParticipantsPage';
import { AdminTransactions } from './(admin)/transactions/AdminTransactions';
import { AdminSettings } from './(admin)/settings/AdminSettings';
import { MerchantDashboard } from './(merchant)/dashboard/MerchantDashboard';
import { MerchantTransactions } from './(merchant)/transactions/MerchantTransactions';
import { MerchantSettlements } from './(merchant)/settlements/MerchantSettlements';
import { MerchantSettings } from './(merchant)/profile/MerchantSettings';
import { SimulatorPage } from './(merchant)/simulator/SimulatorPage';
import { DisbursementsPage } from './(merchant)/disbursements/DisbursementsPage';
import { MerchantAuditTrail } from './(merchant)/audit/MerchantAuditTrail';
import { AuditTrailDetail } from './components/audit/AuditTrailDetail';
import { ApiDocsLayout } from './layouts/ApiDocsLayout';
import { AdminAuditTrail } from './(admin)/audit/AdminAuditTrail';
import NotFound from './components/NotFound';


function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Root → Merchant Login */}
        <Route path="/" element={<Navigate to="/merchant/login" replace />} />
        <Route path="/login" element={<Navigate to="/merchant/login" replace />} />
        <Route path="/merchant/login" element={<MerchantLoginPage />} />
        <Route path="/accept-invite" element={<AcceptInvitePage />} />
        <Route path="/admin/login" element={<Login />} />
        {/* Standalone API Docs */}
        <Route path="/docs" element={<ApiDocsLayout isPublic={true} />} />
        <Route path="/api-docs" element={<Navigate to="/docs" replace />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredAccountType="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="merchants" element={<MerchantsPage />} />
          <Route path="merchants/:merchantId" element={<MerchantDetailPage />} />
          <Route path="participants" element={<ParticipantsPage />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="audit" element={<AdminAuditTrail />} />
          <Route path="audit/:id" element={<AuditTrailDetail scope="admin" />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Merchant Routes */}
        <Route
          path="/merchant"
          element={
            <ProtectedRoute requiredAccountType="merchant">
              <MerchantLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/merchant/dashboard" replace />} />
          <Route path="dashboard" element={<MerchantDashboard />} />
          {/* Legacy routes — redirect to the unified settings page */}
          <Route path="settings/api-keys" element={<Navigate to="/merchant/settings" replace />} />
          <Route path="apps" element={<Navigate to="/merchant/settings" replace />} />
          <Route path="apps/:appId" element={<Navigate to="/merchant/settings" replace />} />
          <Route path="transactions" element={<MerchantTransactions />} />
          <Route path="settlements" element={<MerchantSettlements />} />
          <Route path="simulator" element={<SimulatorPage />} />
          <Route path="disbursements" element={<DisbursementsPage />} />
          <Route path="audit" element={<MerchantAuditTrail />} />
          <Route path="audit/:id" element={<AuditTrailDetail scope="merchant" />} />
          <Route path="settings" element={<MerchantSettings />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App
