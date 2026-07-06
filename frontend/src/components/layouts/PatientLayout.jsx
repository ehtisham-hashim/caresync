import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, Activity, Pill, Calendar, MessageCircle, FileText, ClipboardList } from 'lucide-react';
import { cn } from '../../utils/cn';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const navigation = [
  { name: 'Dashboard', sub: 'Health Overview', href: '/dashboard', icon: Home },
  { name: 'Health & Vitals', sub: 'Track Metrics', href: '/health/vitals', icon: Activity },
  { name: 'Prescriptions', sub: 'Active Meds', href: '/health/prescriptions', icon: Pill },
  { name: 'Visit History', sub: 'Past Records', href: '/health/history', icon: ClipboardList },
  { name: 'Appointments', sub: 'Upcoming Visits', href: '/appointments', icon: Calendar },
  { name: 'AI Companion', sub: '24/7 Support', href: '/chat', icon: MessageCircle },
  { name: 'Submit Report', sub: 'Upload Docs', href: '/reports/new', icon: FileText },
];

export default function PatientLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      <Navbar />
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-64px)]">
        <Sidebar navigation={navigation} />

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
          <div className="flex justify-around items-center p-2">
            {navigation.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex flex-col items-center p-2 rounded-lg transition-colors',
                    isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
                  )}
                >
                  <Icon className="h-6 w-6 mb-1" />
                  <span className="text-[10px] font-medium hidden sm:block">{item.name.split(' ')[0]}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 w-full mx-auto p-6 lg:p-8 overflow-y-auto bg-[#fafafa] pb-24 md:pb-8" style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
