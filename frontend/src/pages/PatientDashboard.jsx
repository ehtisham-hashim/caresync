import { useAuthStore } from '../store/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import Card from '../components/common/Card';
import { Calendar, Activity, Pill, MessageCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function PatientDashboard() {
  const user = useAuthStore((state) => state.user);

  const { data: appointmentsData } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const { data } = await api.get('/appointments?limit=3');
      return data.data;
    },
    retry: false,
  });

  const { data: prescriptionsData } = useQuery({
    queryKey: ['prescriptions', user?.id],
    queryFn: async () => {
      const { data } = await api.get(`/prescriptions/${user?.id}?limit=3`);
      return data.data;
    },
    enabled: !!user?.id,
    retry: false,
  });

  const nextAppointment = appointmentsData?.appointments?.[0];

  const quickActions = [
    { title: 'Book Appointment', icon: Calendar, href: '/appointments', color: 'bg-blue-100 text-blue-600' },
    { title: 'Track Vitals', icon: Activity, href: '/health/vitals', color: 'bg-emerald-100 text-emerald-600' },
    { title: 'Prescriptions', icon: Pill, href: '/health/prescriptions', color: 'bg-violet-100 text-violet-600' },
    { title: 'AI Companion', icon: MessageCircle, href: '/chat', color: 'bg-pink-100 text-pink-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-gray-600 mt-1">Here's your health overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.title} to={action.href}>
              <Card className="hover:shadow-md transition-shadow text-center flex flex-col items-center justify-center h-full">
                <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                  <Icon className="h-6 w-6" />
                </div>
                <p className="font-medium text-gray-900">{action.title}</p>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Next Appointment</h2>
          {nextAppointment ? (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="font-semibold text-gray-900">{nextAppointment.doctor?.name || 'Doctor'}</p>
              <p className="text-gray-600">{nextAppointment.reason || 'Appointment'}</p>
              <div className="mt-2 text-sm font-medium text-blue-600">
                {new Date(nextAppointment.scheduledAt).toLocaleString()}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p>No upcoming appointments</p>
              <Link to="/appointments" className="text-blue-600 font-medium mt-2 inline-block hover:underline">
                Book an appointment
              </Link>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Active Prescriptions</h2>
          {prescriptionsData?.prescriptions?.length > 0 ? (
            <div className="space-y-3">
              {prescriptionsData.prescriptions.map((rx) => (
                <div key={rx.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-900">{rx.medicineName}</p>
                    <p className="text-sm text-gray-600">{rx.dosage}</p>
                  </div>
                  <span className="text-sm font-medium text-violet-600 bg-violet-100 px-2 py-1 rounded">
                    {rx.frequency}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p>No active prescriptions</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
