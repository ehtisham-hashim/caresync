import { useQuery } from '@tanstack/react-query';
import { doctorService } from '../services/doctorService';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import { Users, Calendar, FileText, Activity } from 'lucide-react';
import { formatDate } from '../utils/formatDate';

export default function DoctorDashboard() {
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['doctor-dashboard'],
    queryFn: doctorService.getDashboard,
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['doctor-stats'],
    queryFn: doctorService.getStats,
  });

  if (dashboardLoading || statsLoading) {
    return <Loader size="lg" />;
  }

  const dashboard = dashboardData?.data || {};
  const stats = statsData?.data || {};

  const statCards = [
    {
      title: 'Total Patients',
      value: stats.totalPatients || 0,
      icon: Users,
      color: 'blue',
    },
    {
      title: 'Today\'s Appointments',
      value: dashboard.todayAppointments || 0,
      icon: Calendar,
      color: 'green',
    },
    {
      title: 'Pending Reports',
      value: dashboard.pendingReportsCount || 0,
      icon: FileText,
      color: 'orange',
    },
    {
      title: 'Visits This Month',
      value: stats.visitsThisMonth || 0,
      icon: Activity,
      color: 'purple',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here's your overview for today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${colorClasses[stat.color]}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Upcoming Appointments */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
          <a href="/provider/calendar" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All
          </a>
        </div>
        
        {dashboard.upcomingAppointments?.length > 0 ? (
          <div className="space-y-3">
            {dashboard.upcomingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="shrink-0">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {appointment.patient?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {appointment.reason || 'General Consultation'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(appointment.scheduledAt, 'time')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(appointment.scheduledAt, 'date')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>No upcoming appointments</p>
          </div>
        )}
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Active Prescriptions</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.activePrescriptions || 0}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Visits</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.totalVisits || 0}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Upcoming Appointments</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.upcomingAppointments || 0}</p>
        </Card>
      </div>
    </div>
  );
}
