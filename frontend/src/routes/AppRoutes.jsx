import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PatientLayout from '../components/layouts/PatientLayout';
import DoctorLayout from '../components/layouts/DoctorLayout';
import Navbar from '../components/layouts/Navbar';

// Patient Pages
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import PatientDashboard from '../pages/PatientDashboard';
import ChatPage from '../pages/ChatPage';
import SubmitReportPage from '../pages/SubmitReportPage';
import AppointmentsPage from '../pages/AppointmentsPage';
import PrescriptionsPage from '../pages/PrescriptionsPage';
import VitalsPage from '../pages/VitalsPage';

// Doctor Pages
import DoctorDashboard from '../pages/DoctorDashboard';
import DoctorPatientsPage from '../pages/DoctorPatientsPage';
import PatientDetailPage from '../pages/PatientDetailPage';
import ScribePage from '../pages/ScribePage';
import DoctorReportsPage from '../pages/DoctorReportsPage';
import DoctorCalendarPage from '../pages/DoctorCalendarPage';
import DoctorVisitsPage from '../pages/DoctorVisitsPage';

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

      {/* Doctor Routes */}
      <Route element={<ProtectedRoute allowedRoles={['DOCTOR']} />}>
        <Route element={<DoctorLayout />}>
          <Route path="/provider/dashboard" element={<DoctorDashboard />} />
          <Route path="/provider/patients" element={<DoctorPatientsPage />} />
          <Route path="/provider/patients/:patientId" element={<PatientDetailPage />} />
          <Route path="/provider/scribe" element={<ScribePage />} />
          <Route path="/provider/reports" element={<DoctorReportsPage />} />
          <Route path="/provider/calendar" element={<DoctorCalendarPage />} />
          <Route path="/provider/visits" element={<DoctorVisitsPage />} />
          <Route path="/provider/visits/:visitId" element={<DoctorVisitsPage />} />
        </Route>
      </Route>
      
      {/* Fallback */}
      <Route path="*" element={<div className="min-h-screen flex items-center justify-center bg-gray-50"><h1 className="text-3xl font-bold text-gray-800">404 - Page Not Found</h1></div>} />
    </Routes>
  );
}
