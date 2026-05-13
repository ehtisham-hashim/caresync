import { Outlet, NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  Stethoscope, 
  ClipboardList,
  LogOut,
  User
} from 'lucide-react';
import { cn } from '../../utils/cn';

export default function DoctorLayout() {
  const { user, logout } = useAuthStore();

  const navigation = [
    { name: 'Dashboard', href: '/provider/dashboard', icon: LayoutDashboard },
    { name: 'My Patients', href: '/provider/patients', icon: Users },
    { name: 'Calendar', href: '/provider/calendar', icon: Calendar },
    { name: 'AI Scribe', href: '/provider/scribe', icon: Stethoscope },
    { name: 'Reports', href: '/provider/reports', icon: ClipboardList },
    { name: 'Visits', href: '/provider/visits', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <Stethoscope className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">CareSync</span>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || 'Doctor'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  )
                }
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={logout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="pl-64">
        <main className="py-6 px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
