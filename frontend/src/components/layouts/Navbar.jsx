import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Heart, LogOut, Menu, X, User } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 h-[72px] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-3 group">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <Heart className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 leading-none">CareSync</h1>
          <p className="text-[10px] font-bold text-gray-400 tracking-wider mt-1 hidden sm:block">HEALTHCARE MANAGEMENT SYSTEM</p>
        </div>
      </Link>

      <div className="flex items-center gap-4 sm:gap-6">
        {isAuthenticated ? (
          <>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#114b5f] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden sm:block text-right mr-2">
                <p className="text-sm font-bold text-gray-900 leading-tight">{user?.name || 'User'}</p>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{user?.role || 'PATIENT'}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-[#da3333] hover:bg-red-700 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        ) : (
          <>
            <div className="hidden sm:flex items-center gap-6">
              <Link
                to="/login"
                className="text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-[#1976d2] text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-[#1565c0] transition-colors shadow-sm"
              >
                Get Started
              </Link>
            </div>
            
            {/* Mobile Menu Button for unauthenticated */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </>
        )}
      </div>

      {/* Mobile Menu for unauthenticated users */}
      {!isAuthenticated && mobileMenuOpen && (
        <div className="absolute top-[72px] left-0 right-0 border-b border-gray-200 bg-white shadow-md sm:hidden">
          <div className="px-4 py-4 flex flex-col gap-3">
            <Link
              to="/login"
              className="block text-base font-bold text-gray-700 hover:text-blue-600 transition-colors py-2 text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="block bg-[#1976d2] text-white px-4 py-3 rounded-lg text-base font-bold text-center shadow-sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
