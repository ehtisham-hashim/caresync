import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllUsers } from '../../services/adminService';
import Loader from '../../components/common/Loader';
import { format } from 'date-fns';
import { cn } from '../../utils/cn';

const TABS = [
  { id: 'ALL', label: 'All Users' },
  { id: 'PATIENT', label: 'Patients' },
  { id: 'DOCTOR', label: 'Doctors' },
  { id: 'ADMIN', label: 'Admins' },
];

export default function AdminUsersList() {
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('ALL');
  const limit = 50; // increased limit so tabs have more data to filter on the client side

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['adminUsers', page, limit],
    queryFn: () => getAllUsers(page, limit),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        Error loading users: {error.message}
      </div>
    );
  }

  const users = data?.data?.users || [];
  const total = data?.data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  // Filter users based on active tab
  const filteredUsers = activeTab === 'ALL' 
    ? users 
    : users.filter(user => user.role === activeTab);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          A complete list of all registered users in the system.
        </p>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden flex flex-col">
        
        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50/50 px-4 pt-4">
          <nav className="flex space-x-4" aria-label="Tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setPage(1); // Reset page when changing tabs to avoid empty views
                }}
                className={cn(
                  'whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors',
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                      user.role === 'ADMIN' && 'bg-purple-100 text-purple-800',
                      user.role === 'DOCTOR' && 'bg-blue-100 text-blue-800',
                      user.role === 'PATIENT' && 'bg-emerald-100 text-emerald-800'
                    )}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    <p className="text-sm">No {activeTab !== 'ALL' ? activeTab.toLowerCase() + 's' : 'users'} found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50/50">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500 font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
