import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';

// Layouts
import AdminLayout from './components/layout/AdminLayout';
import PublicLayout from './components/layout/PublicLayout';
import MemberLayout from './components/layout/MemberLayout';

// Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Public
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import MembershipsPage from './pages/public/MembershipsPage';
import TrainersPage from './pages/public/TrainersPage';
import ContactPage from './pages/public/ContactPage';

// Admin
import DashboardPage from './pages/admin/DashboardPage';
import MembersListPage from './pages/admin/MembersListPage';
import MemberProfilePage from './pages/admin/MemberProfilePage';
import AddMemberPage from './pages/admin/AddMemberPage';
import PlansPage from './pages/admin/PlansPage';
import SubscriptionsPage from './pages/admin/SubscriptionsPage';
import PaymentsPage from './pages/admin/PaymentsPage';
import AttendancePage from './pages/admin/AttendancePage';
import TrainersAdminPage from './pages/admin/TrainersAdminPage';
import ExpensesPage from './pages/admin/ExpensesPage';
import ReportsPage from './pages/admin/ReportsPage';
import EnquiriesPage from './pages/admin/EnquiriesPage';
import SettingsPage from './pages/admin/SettingsPage';

// Member Portal
import MemberDashboard from './pages/member/MemberDashboard';
import MemberProfile from './pages/member/MemberProfile';
import MemberPayments from './pages/member/MemberPayments';
import MemberAttendance from './pages/member/MemberAttendance';

// Guards
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleGuard from './components/auth/RoleGuard';

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e1e1e',
            color: '#fff',
            border: '1px solid #2e2e2e',
            borderRadius: '10px',
          },
          success: { iconTheme: { primary: '#84cc16', secondary: '#000' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />

      {/* Demo banner */}
      {import.meta.env.VITE_DEMO_MODE === 'false' && (
        <div className="demo-banner">
          🎯 DEMO MODE — Login: admin@fitmanager.com / Admin@123
        </div>
      )}

      <Routes>
        {/* Public Website */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/memberships" element={<MembershipsPage />} />
          <Route path="/trainers" element={<TrainersPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleGuard roles={['admin', 'staff']}>
                <AdminLayout />
              </RoleGuard>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="members" element={<MembersListPage />} />
          <Route path="members/add" element={<AddMemberPage />} />
          <Route path="members/:id" element={<MemberProfilePage />} />
          <Route path="plans" element={<PlansPage />} />
          <Route path="subscriptions" element={<SubscriptionsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="trainers" element={<TrainersAdminPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="enquiries" element={<EnquiriesPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Member Portal */}
        <Route
          path="/portal"
          element={
            <ProtectedRoute>
              <MemberLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/portal/dashboard" replace />} />
          <Route path="dashboard" element={<MemberDashboard />} />
          <Route path="profile" element={<MemberProfile />} />
          <Route path="payments" element={<MemberPayments />} />
          <Route path="attendance" element={<MemberAttendance />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
