import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';
import AiChatWidget from './components/AiChatWidget';
import InitialLanguageModal from './components/ui/InitialLanguageModal';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Customer Portal
import CustomerLayout from './pages/customer/CustomerLayout';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import BookingPage from './pages/customer/BookingPage';
import BookingTracker from './pages/customer/BookingTracker';
import LiveTrackingMap from './pages/customer/LiveTrackingMap';
import BookingHistory from './pages/customer/BookingHistory';
import CustomerProfile from './pages/customer/CustomerProfile';

// Worker Portal
import WorkerLayout from './pages/worker/WorkerLayout';
import WorkerDashboard from './pages/worker/WorkerDashboard';
import JobFeed from './pages/worker/JobFeed';
import WorkerProfile from './pages/worker/WorkerProfile';
import LeaveRequests from './pages/worker/LeaveRequests';
import WorkerTrainingPortal from './pages/worker/WorkerTrainingPortal';

// Admin Portal
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import WorkerManagement from './pages/admin/WorkerManagement';
import ComplaintsDashboard from './pages/admin/ComplaintsDashboard';
import DemandForecast from './pages/admin/DemandForecast';

// AI chat widget shown only when authenticated
function AuthenticatedAIWidget() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <AiChatWidget /> : null;
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
        <Routes>
          {/* Public — Auth */}
          <Route path="/auth" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />

          {/* Customer Portal */}
          <Route
            path="/customer"
            element={
              <ProtectedRoute requiredRole="customer">
                <CustomerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<CustomerDashboard />} />
            <Route path="book" element={<BookingPage />} />
            <Route path="bookings" element={<BookingTracker />} />
            <Route path="track/:bookingId" element={<LiveTrackingMap />} />
            <Route path="history" element={<BookingHistory />} />
            <Route path="profile" element={<CustomerProfile />} />
          </Route>

          {/* Worker Portal */}
          <Route
            path="/worker"
            element={
              <ProtectedRoute requiredRole="worker">
                <WorkerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<WorkerDashboard />} />
            <Route path="jobs" element={<JobFeed />} />
            <Route path="profile" element={<WorkerProfile />} />
            <Route path="leave" element={<LeaveRequests />} />
            <Route path="training" element={<WorkerTrainingPortal />} />
          </Route>

          {/* Admin Portal */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="workers" element={<WorkerManagement />} />
            <Route path="complaints" element={<ComplaintsDashboard />} />
            <Route path="forecast" element={<DemandForecast />} />
          </Route>

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>

        {/* Global AI chat widget — visible when authenticated */}
        <AuthenticatedAIWidget />

        {/* Global Language selection on first load */}
        <InitialLanguageModal />
      </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
