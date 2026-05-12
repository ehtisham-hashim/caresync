import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, Activity, Pill, Calendar, MessageCircle, FileText } from 'lucide-react';
import { cn } from '../../utils/cn';
import Navbar from './Navbar';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Health & Vitals', href: '/health/vitals', icon: Activity },
  { name: 'Prescriptions', href: '/health/prescriptions', icon: Pill },
  { name: 'Appointments', href: '/appointments', icon: Calendar },
  { name: 'AI Companion', href: '/chat', icon: MessageCircle },
  { name: 'Submit Report', href: '/reports/new', icon: FileText },
];

export default function PatientLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-[calc(100vh-4rem)] sticky top-16">
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium',
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon className={cn('h-5 w-5', isActive ? 'text-blue-600' : 'text-gray-500')} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

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
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
