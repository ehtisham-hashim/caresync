import { useQuery } from '@tanstack/react-query';
import { getAdminAnalytics, getAuditLogs } from '../../services/adminService';
import Loader from '../../components/common/Loader';
import { Users, Activity, Calendar, ArrowRight, ShieldAlert, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
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
    { name: 'TOTAL USERS', sub: 'All registered users', value: stats.totalUsers || 0, icon: Users, color: 'text-[#4e89ff]', bg: 'bg-[#eef4ff]', border: 'border-l-[#4e89ff]', wrapperBorder: 'border-[#d0e1ff]' },
    { name: 'TOTAL PATIENTS', sub: 'Verified patients', value: stats.totalPatients || 0, icon: UserPlus, color: 'text-[#10b981]', bg: 'bg-[#ecfdf5]', border: 'border-l-[#10b981]', wrapperBorder: 'border-[#a7f3d0]' },
    { name: 'TOTAL DOCTORS', sub: 'Verified doctors', value: stats.totalDoctors || 0, icon: Activity, color: 'text-[#a855f7]', bg: 'bg-[#faf5ff]', border: 'border-l-[#a855f7]', wrapperBorder: 'border-[#e9d5ff]' },
    { name: 'TOTAL VISITS', sub: 'All appointments', value: stats.totalVisits || 0, icon: Calendar, color: 'text-[#f59e0b]', bg: 'bg-[#fffbeb]', border: 'border-l-[#f59e0b]', wrapperBorder: 'border-[#fde68a]' },
  ];

  const chartData = [
    { name: 'Mon', users: Math.round((stats.totalUsers || 0) * 0.4), visits: Math.round((stats.totalVisits || 0) * 0.3) },
    { name: 'Tue', users: Math.round((stats.totalUsers || 0) * 0.5), visits: Math.round((stats.totalVisits || 0) * 0.4) },
    { name: 'Wed', users: Math.round((stats.totalUsers || 0) * 0.55), visits: Math.round((stats.totalVisits || 0) * 0.45) },
    { name: 'Thu', users: Math.round((stats.totalUsers || 0) * 0.7), visits: Math.round((stats.totalVisits || 0) * 0.6) },
    { name: 'Fri', users: Math.round((stats.totalUsers || 0) * 0.8), visits: Math.round((stats.totalVisits || 0) * 0.7) },
    { name: 'Sat', users: Math.round((stats.totalUsers || 0) * 0.9), visits: Math.round((stats.totalVisits || 0) * 0.8) },
    { name: 'Sun', users: stats.totalUsers || 0, visits: stats.totalVisits || 0 },
  ];

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const nameParts = stat.name.split(' ');
          const line1 = nameParts[0];
          const line2 = nameParts.slice(1).join(' ');

          return (
            <motion.div 
              key={stat.name} 
              variants={itemVariants}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className={`bg-white rounded-2xl p-5 border ${stat.wrapperBorder} shadow-sm border-l-[5px] ${stat.border} flex items-center justify-between transition-all`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide leading-[1.1]">{line1}</span>
                  {line2 && <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide leading-[1.1]">{line2}</span>}
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[28px] font-black text-gray-900 leading-none">{stat.value}</span>
                <span className="text-[10px] font-medium text-gray-400 mt-1 whitespace-nowrap">{stat.sub}</span>
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
          className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 bg-[#1976d2] rounded-full"></div>
              <h2 className="text-xl font-bold text-[#2c3e50]">Platform Growth</h2>
            </div>
            <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>This Year</option>
            </select>
          </div>
          
          <div className="flex-1 min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4e89ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4e89ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 500 }} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Area type="monotone" dataKey="users" stroke="#4e89ff" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Activity Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 bg-[#1976d2] rounded-full"></div>
              <h2 className="text-xl font-bold text-[#2c3e50]">Activity</h2>
            </div>
            <Link to="/admin/logs" className="text-sm text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 transition-colors">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="flex-1 flex flex-col gap-6">
            {recentLogs.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-12">
                <ShieldAlert className="h-10 w-10 mb-3 opacity-20" />
                <p className="text-sm font-medium">No recent activity.</p>
              </div>
            ) : (
              recentLogs.map((log, index) => (
                <div key={log.id} className="relative flex gap-4 group">
                  {index !== recentLogs.length - 1 && (
                    <div className="absolute top-8 bottom-[-24px] left-[15px] w-px bg-blue-100" />
                  )}
                  
                  <div className="relative z-10 flex-shrink-0 mt-1">
                    <div className="h-[30px] w-[30px] rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 shadow-sm transition-transform group-hover:scale-110">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                    </div>
                  </div>
                  
                  <div className="flex-1 bg-gray-50/50 rounded-xl p-3 border border-gray-100 transition-colors group-hover:bg-blue-50/30">
                    <p className="text-sm font-bold text-gray-800 leading-tight">
                      {log.action}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-mono bg-white border border-gray-200 px-2 py-0.5 rounded-md text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        {log.entityType}
                      </span>
                      <span className="text-[11px] font-medium text-gray-400">{format(new Date(log.createdAt), 'h:mm a')}</span>
                    </div>
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
