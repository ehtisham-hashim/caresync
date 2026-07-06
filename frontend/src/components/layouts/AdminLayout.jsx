import { Outlet } from 'react-router-dom';
import { LayoutDashboard, UserPlus, Activity, Calendar, ShieldAlert } from 'lucide-react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const navigation = [
  { name: 'Dashboard', sub: 'Overview & Statistics', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Patients', sub: 'Manage Patients', href: '/admin/users?role=PATIENT', icon: UserPlus },
  { name: 'Doctors', sub: 'Manage Doctors', href: '/admin/users?role=DOCTOR', icon: Activity },
  { name: 'Appointments', sub: 'View Appointments', href: '/admin/assignments', icon: Calendar },
  { name: 'Audit Logs', sub: 'System Activity', href: '/admin/logs', icon: ShieldAlert },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      <Navbar />

      <div className="flex flex-1 overflow-hidden h-[calc(100vh-72px)]">
        <Sidebar navigation={navigation} />

        {/* Main Content */}
        <main className="flex-1 w-full mx-auto p-6 lg:p-8 overflow-y-auto bg-[#fafafa]" style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
