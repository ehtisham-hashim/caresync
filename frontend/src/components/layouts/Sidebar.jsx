import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';

export default function Sidebar({ navigation }) {
  const location = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-[260px] bg-white border-r border-gray-200 h-full">
      <div className="px-6 pt-6 pb-2">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">MAIN MENU</span>
          <div className="h-px bg-gray-100 flex-1"></div>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          
          const isActive = (() => {
            const [path, query] = item.href.split('?');
            if (path !== location.pathname && !location.pathname.startsWith(path + '/')) return false;
            if (query) {
              return location.search.includes(query);
            }
            return true;
          })();

          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative group overflow-hidden',
                isActive
                  ? 'bg-[#e3f2fd] border border-[#bbdefb]' 
                  : 'hover:bg-gray-50 border border-transparent'
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1976d2] rounded-l-xl"></div>
              )}
              <div className={cn("flex items-center justify-center w-8 h-8 rounded-lg", isActive ? "text-[#1976d2]" : "text-gray-400 group-hover:text-gray-600")}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className={cn("text-[13px] font-bold leading-tight", isActive ? "text-[#0d47a1]" : "text-gray-700 group-hover:text-gray-900")}>{item.name}</p>
                <p className={cn("text-[10px] mt-0.5", isActive ? "text-[#1976d2]" : "text-gray-400")}>{item.sub || 'Overview'}</p>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
