import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/useAuthStore';
import { Calendar as CalendarIcon, Users, FileText, Clock } from 'lucide-react';
import Card from '../../components/common/Card';
import api from '../../services/api';
import { formatDateTime } from '../../utils/formatDate';
import { Link } from 'react-router-dom';

export default function DoctorDashboard() {
  const user = useAuthStore(state => state.user);

  const { data: appointmentsData } = useQuery({
    queryKey: ['doctor-appointments'],
    queryFn: async () => {
      const { data } = await api.get('/appointments');
      return data.data;
    },
  });

  const { data: patientsData } = useQuery({
    queryKey: ['patients-list'],
    queryFn: async () => {
      const { data } = await api.get('/users/patients');
      return data.data;
    },
  });

  const stats = [
    { name: "Today's Appointments", value: appointmentsData?.appointments?.length || 0, icon: CalendarIcon, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: "Total Patients", value: patientsData?.length || 0, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: "Pending Reports", value: 0, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-100' }, // Mock for now
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dr. {user?.name?.split(' ')[1] || user?.name}</h1>
        <p className="text-gray-600 mt-1">Here is your daily overview</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {stats.map(stat => (
          <Card key={stat.name} className="flex items-center p-6 gap-4">
            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Upcoming Appointments</h2>
            <Link to="/provider/calendar" className="text-sm text-blue-600 font-medium hover:underline">View All</Link>
          </div>
          <div className="space-y-4 flex-1">
            {appointmentsData?.appointments?.length > 0 ? (
              appointmentsData.appointments.slice(0, 4).map(apt => (
                <div key={apt.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-semibold text-gray-900">{apt.patient?.name || 'Patient'}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                      <Clock className="h-3 w-3" />
                      {formatDateTime(apt.scheduledAt)}
                    </div>
                  </div>
                  <Link 
                    to={`/provider/scribe/${apt.patientId}?appointmentId=${apt.id}`}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-md hover:bg-blue-100 transition-colors"
                  >
                    Start Visit
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No upcoming appointments</p>
            )}
          </div>
        </Card>

        <Card className="flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Patients</h2>
            <Link to="/provider/patients" className="text-sm text-blue-600 font-medium hover:underline">Directory</Link>
          </div>
          <div className="space-y-4 flex-1">
            {patientsData?.slice(0, 4).map(patient => (
              <div key={patient.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">{patient.name}</p>
                  <p className="text-sm text-gray-500">{patient.email}</p>
                </div>
                <Link 
                  to={`/provider/patients/${patient.id}`}
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                >
                  View Profile
                </Link>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
