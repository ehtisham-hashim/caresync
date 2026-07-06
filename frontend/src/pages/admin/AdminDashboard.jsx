import { useQuery } from '@tanstack/react-query';
import { getAdminAnalytics, getAuditLogs } from '../../services/adminService';
import Loader from '../../components/common/Loader';
import { Users, User, Activity, ClipboardList, Calendar, ArrowUpRight, ArrowRight, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

// Mock data for the chart to make the dashboard look active and beautiful
const mockChartData = [
  { name: 'Mon', users: 400, visits: 240 },
  { name: 'Tue', users: 300, visits: 139 },
  { name: 'Wed', users: 550, visits: 380 },
  { name: 'Thu', users: 450, visits: 390 },
  { name: 'Fri', users: 600, visits: 480 },
  { name: 'Sat', users: 700, visits: 380 },
  { name: 'Sun', users: 850, visits: 430 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function AdminDashboard() {
  const { data: analyticsData, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: getAdminAnalytics,
  });

  const { data: logsData, isLoading: isLogsLoading } = useQuery({
    queryKey: ['adminAuditLogs', 1, 5],
    queryFn: () => getAuditLogs(1, 5),
  });

  if (isAnalyticsLoading || isLogsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size="lg" />
      </div>
    );
  }

  const stats = analyticsData?.data || {};
  const recentLogs = logsData?.data?.logs || [];

  const statCards = [
    { name: 'Total Users', value: stats.totalUsers || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { name: 'Total Doctors', value: stats.totalDoctors || 0, icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
    { name: 'Total Patients', value: stats.totalPatients || 0, icon: User, color: 'text-emerald-600', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { name: 'Total Visits', value: stats.totalVisits || 0, icon: ClipboardList, color: 'text-orange-600', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p className="mt-2 text-sm text-gray-500">
            Monitor system health, user growth, and recent activities across CareSync.
          </p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100"
        >
          {format(new Date(), 'EEEE, MMMM do, yyyy')}
        </motion.div>
      </div>

      {/* KPI Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={stat.name} 
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className={`relative overflow-hidden bg-white rounded-2xl p-6 shadow-sm border ${stat.border} group`}
            >
              <div className="absolute -right-6 -top-6 transition-transform duration-500 group-hover:scale-110 opacity-50">
                <div className={`h-24 w-24 rounded-full ${stat.bg} blur-2xl`} />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <span className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    +12% <ArrowUpRight className="h-3 w-3 ml-0.5" />
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts & Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Chart Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Platform Growth</h2>
              <p className="text-sm text-gray-500">Weekly active users vs. clinical visits</p>
            </div>
            <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>This Year</option>
            </select>
          </div>
          
          <div className="flex-1 min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                <Area type="monotone" dataKey="visits" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Activity Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
            <Link to="/admin/logs" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="flex-1 flex flex-col gap-5">
            {recentLogs.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                <ShieldAlert className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-sm">No recent activity.</p>
              </div>
            ) : (
              recentLogs.map((log, index) => (
                <div key={log.id} className="relative flex gap-4">
                  {/* Timeline connector */}
                  {index !== recentLogs.length - 1 && (
                    <div className="absolute top-8 bottom-[-20px] left-4 w-px bg-gray-200" />
                  )}
                  
                  <div className="relative z-10 flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 shadow-sm">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                    </div>
                  </div>
                  
                  <div className="flex-1 pb-1">
                    <p className="text-sm font-medium text-gray-900 leading-tight">
                      {log.action}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                      <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-[10px] text-gray-600">
                        {log.entityType}
                      </span>
                      •
                      <span>{format(new Date(log.createdAt), 'h:mm a')}</span>
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
