import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PatientLayout from '../components/layouts/PatientLayout';
import Navbar from '../components/layouts/Navbar';

// Pages
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import PatientDashboard from '../pages/PatientDashboard';
import ChatPage from '../pages/ChatPage';
import SubmitReportPage from '../pages/SubmitReportPage';
import AppointmentsPage from '../pages/AppointmentsPage';
import PrescriptionsPage from '../pages/PrescriptionsPage';
import VitalsPage from '../pages/VitalsPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<><Navbar /><LandingPage /></>} />
      <Route path="/login" element={<><Navbar /><LoginPage /></>} />
      <Route path="/register" element={<><Navbar /><RegisterPage /></>} />

      {/* Patient Routes */}
      <Route element={<ProtectedRoute allowedRoles={['PATIENT']} />}>
        <Route element={<PatientLayout />}>
          <Route path="/dashboard" element={<PatientDashboard />} />
          <Route path="/health/vitals" element={<VitalsPage />} />
          <Route path="/health/prescriptions" element={<PrescriptionsPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/reports/new" element={<SubmitReportPage />} />
        </Route>
      </Route>

      {/* Doctor Routes (Placeholders) */}
      <Route element={<ProtectedRoute allowedRoles={['DOCTOR']} />}>
        <Route path="/provider/dashboard" element={<><Navbar /><div className="p-8 text-center text-xl font-bold">Doctor Dashboard (Coming Soon)</div></>} />
      </Route>
      
      {/* Fallback */}
      <Route path="*" element={<div className="min-h-screen flex items-center justify-center bg-gray-50"><h1 className="text-3xl font-bold text-gray-800">404 - Page Not Found</h1></div>} />
    </Routes>
  );
}
