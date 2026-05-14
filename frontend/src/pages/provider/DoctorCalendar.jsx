import { useQuery } from '@tanstack/react-query';
import { Calendar as CalendarIcon, Clock, User, Check, X } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function DoctorCalendar() {
  const { data: appointmentsData, refetch, isLoading } = useQuery({
    queryKey: ['doctor-appointments'],
    queryFn: async () => {
      const { data } = await api.get('/appointments');
      return data.data;
    },
  });

  const handleStatusUpdate = async (id, status) => {
    try {
      if (status === 'CONFIRMED') {
        await api.patch(`/appointments/${id}/confirm`);
      } else if (status === 'CANCELLED') {
        await api.patch(`/appointments/${id}/cancel`);
      } else {
        await api.put(`/appointments/${id}`, { status });
      }
      toast.success(`Appointment marked as ${status.toLowerCase()}`);
      refetch();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (isLoading) return <div className="text-center py-12">Loading schedule...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
          <p className="text-gray-600 mt-1">Manage your appointments</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-4 border-b border-gray-200 bg-gray-50 p-4 font-semibold text-sm text-gray-700 hidden md:grid">
          <div>Patient / Time</div>
          <div>Reason</div>
          <div>Status</div>
          <div className="text-right">Actions</div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {appointmentsData?.appointments?.length > 0 ? (
            appointmentsData.appointments.map(apt => (
              <div key={apt.id} className="grid grid-cols-1 md:grid-cols-4 p-4 gap-4 items-center hover:bg-gray-50 transition-colors">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-semibold text-gray-900">{apt.patient?.name || 'Unknown Patient'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(apt.scheduledAt).toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-700">
                  <span className="md:hidden font-semibold mr-2">Reason:</span>
                  {apt.reason || 'No reason provided'}
                </div>
                
                <div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                    ${apt.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : 
                      apt.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 
                      apt.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 
                      'bg-gray-100 text-gray-800'}`}
                  >
                    {apt.status.toLowerCase()}
                  </span>
                </div>
                
                <div className="flex gap-2 md:justify-end">
                  {apt.status === 'PENDING' && (
                    <>
                      <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => handleStatusUpdate(apt.id, 'CONFIRMED')}>
                        <Check className="h-4 w-4 mr-1" /> Confirm
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleStatusUpdate(apt.id, 'CANCELLED')}>
                        <X className="h-4 w-4 mr-1" /> Cancel
                      </Button>
                    </>
                  )}
                  {apt.status === 'CONFIRMED' && (
                    <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => handleStatusUpdate(apt.id, 'COMPLETED')}>
                      <Check className="h-4 w-4 mr-1" /> Complete
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-gray-500">
              <CalendarIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No appointments found in your schedule.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
