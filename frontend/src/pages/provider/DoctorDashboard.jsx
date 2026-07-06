import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/useAuthStore';
import { Calendar as CalendarIcon, Users, FileText, Clock } from 'lucide-react';
import Card from '../../components/common/Card';
import api, { getAccessToken } from '../../services/api';
import { formatDateTime } from '../../utils/formatDate';
import { Link } from 'react-router-dom';

export default function DoctorDashboard() {
  const user = useAuthStore(state => state.user);

  const { data: appointmentsData, refetch } = useQuery({
    queryKey: ['doctor-appointments'],
    queryFn: async () => {
      const { data } = await api.get('/appointments');
      return data.data;
    },
  });

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    const sseUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'}/appointments/updates?token=${token}`;
    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'appointments-updated') {
          refetch();
        }
      } catch (e) {
        console.error('SSE parse error:', e);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [user, refetch]);

  const { data: patientsData } = useQuery({
    queryKey: ['patients-list'],
    queryFn: async () => {
      const { data } = await api.get('/users/patients');
      return data.data;
    },
  });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // Filter for actual upcoming appointments: scheduled today or in the future AND status is PENDING or CONFIRMED
  const upcomingAppointments = appointmentsData?.appointments?.filter(apt => {
    if (apt.status === 'COMPLETED' || apt.status === 'CANCELLED') {
      return false;
    }
    const aptDate = new Date(apt.scheduledAt);
    return aptDate >= todayStart;
  }) || [];

  // Filter for today's active appointments
  const todayAppointments = appointmentsData?.appointments?.filter(apt => {
    const aptDate = new Date(apt.scheduledAt);
    return aptDate >= todayStart && aptDate <= todayEnd && apt.status !== 'CANCELLED';
  }) || [];

  const stats = [
    { name: "Today's Appointments", value: todayAppointments.length, icon: CalendarIcon, color: 'text-[#1976d2]', bg: 'bg-[#e3f2fd]' },
    { name: "Total Patients", value: patientsData?.length || 0, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: "Pending Reports", value: 0, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-100' }, // Mock for now
  ];

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-5 bg-[#1976d2] rounded-full"></div>
        <div>
          <h2 className="text-xl font-bold text-[#2c3e50]">
            Dr. {user?.name?.split(' ')[1] || user?.name}
          </h2>
          <p className="text-sm text-gray-500 mt-1">Here is your daily overview</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
          {stats.map(stat => (
            <div key={stat.name} className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex items-center gap-4">
              <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500">{stat.name}</p>
                <p className="text-2xl font-bold text-[#2c3e50]">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#2c3e50]">Upcoming Appointments</h3>
              <Link to="/provider/calendar" className="text-sm text-[#1976d2] font-bold hover:underline">View All</Link>
            </div>
            <div className="space-y-4 flex-1">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.slice(0, 4).map(apt => (
                  <div key={apt.id} className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-shadow">
                    <div>
                      <p className="font-bold text-[#2c3e50]">{apt.patient?.name || 'Patient'}</p>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <Clock className="h-3 w-3" />
                        <span className="font-medium text-[#1976d2]">{formatDateTime(apt.scheduledAt)}</span>
                      </div>
                    </div>
                    <Link 
                      to={`/provider/scribe/${apt.patientId}?appointmentId=${apt.id}`}
                      className="px-4 py-2 bg-[#e3f2fd] text-[#1976d2] text-sm font-bold rounded-lg hover:bg-[#bbdefb] transition-colors"
                    >
                      Start Visit
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">No upcoming appointments</p>
              )}
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#2c3e50]">Recent Patients</h3>
              <Link to="/provider/patients" className="text-sm text-[#1976d2] font-bold hover:underline">Directory</Link>
            </div>
            <div className="space-y-4 flex-1">
              {patientsData?.slice(0, 4).map(patient => (
                <div key={patient.id} className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-xl">
                  <div>
                    <p className="font-bold text-[#2c3e50]">{patient.name}</p>
                    <p className="text-sm text-gray-500 font-medium">{patient.email}</p>
                  </div>
                  <Link 
                    to={`/provider/patients/${patient.id}`}
                    className="text-sm font-bold text-gray-400 hover:text-[#1976d2] transition-colors"
                  >
                    View Profile
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
