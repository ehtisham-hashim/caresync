import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Clock, User, Plus, AlertTriangle } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import toast from 'react-hot-toast';
import api, { getAccessToken } from '../services/api';
import { formatDateTime } from '../utils/formatDate';
import { useAuthStore } from '../store/useAuthStore';

const appointmentSchema = z.object({
  doctorId: z.string().min(1, 'Please select a doctor'),
  scheduledAt: z.string().min(1, 'Please select a date and time'),
  reason: z.string().min(1, 'Please provide a reason for the visit'),
});

export default function AppointmentsPage() {
  const [showModal, setShowModal] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);

  const { data: appointmentsData, refetch } = useQuery({
    queryKey: ['appointments'],
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

  const { data: doctorsData } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const { data } = await api.get('/users/doctors');
      return data.data;
    },
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(appointmentSchema),
  });

  const cancelMutation = useMutation({
    mutationFn: async (appointmentId) => {
      await api.patch(`/appointments/${appointmentId}/cancel`);
    },
    onSuccess: () => {
      toast.success('Appointment cancelled successfully');
      queryClient.invalidateQueries(['appointments']);
    },
    onError: () => {
      toast.error('Failed to cancel appointment');
    },
  });

  const handleCancelAppointment = (appointmentId) => {
    setCancelTargetId(appointmentId);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formattedDate = new Date(data.scheduledAt).toISOString();
      await api.post('/appointments', {
        ...data,
        scheduledAt: formattedDate,
      });
      toast.success('Appointment scheduled successfully');
      setShowModal(false);
      reset();
      refetch();
    } catch (error) {
      toast.error('Failed to schedule appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'text-emerald-700 bg-emerald-100';
      case 'PENDING': return 'text-amber-700 bg-amber-100';
      case 'COMPLETED': return 'text-blue-700 bg-blue-100';
      case 'CANCELLED': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-1">Manage your upcoming and past visits</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Book Appointment
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {appointmentsData?.appointments?.length > 0 ? (
          appointmentsData.appointments.map((apt) => (
            <Card key={apt.id} className="flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                    {apt.doctor?.name?.charAt(0) || 'D'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{apt.doctor?.name || 'Doctor'}</h3>
                    <p className="text-sm text-gray-600">{apt.doctor?.specialization || 'Provider'}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-md text-xs font-semibold ${getStatusColor(apt.status)}`}>
                  {apt.status}
                </span>
              </div>
              <div className="space-y-2 mb-4 flex-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDateTime(apt.scheduledAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{apt.reason}</span>
                </div>
              </div>
              {apt.status === 'PENDING' || apt.status === 'CONFIRMED' ? (
                <div className="pt-4 border-t border-gray-100">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    onClick={() => handleCancelAppointment(apt.id)}
                    isLoading={cancelMutation.isPending}
                  >
                    Cancel Appointment
                  </Button>
                </div>
              ) : null}
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-200 border-dashed">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-900">No appointments found</p>
            <p className="mt-1">You haven't scheduled any appointments yet.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Book New Appointment</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                <select
                  {...register('doctorId')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Doctor</option>
                  {doctorsData?.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.doctorProfile?.specialization || 'General'})</option>
                  ))}
                </select>
                {errors.doctorId && <p className="text-red-500 text-sm mt-1">{errors.doctorId.message}</p>}
              </div>
              
              <Input
                label="Date & Time"
                type="datetime-local"
                {...register('scheduledAt')}
                error={errors.scheduledAt?.message}
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label>
                <textarea
                  {...register('reason')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                ></textarea>
                {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason.message}</p>}
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" isLoading={isSubmitting}>
                  Book
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {cancelTargetId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setCancelTargetId(null)}>
          <Card className="w-full max-w-sm p-6 text-center space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Cancel Appointment</h3>
              <p className="text-sm text-gray-500 mt-1">Are you sure you want to cancel this appointment? This action cannot be undone.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => setCancelTargetId(null)}
              >
                No, Keep
              </Button>
              <Button 
                className="flex-1 bg-red-600 hover:bg-red-700 text-white" 
                onClick={() => {
                  cancelMutation.mutate(cancelTargetId);
                  setCancelTargetId(null);
                }}
                isLoading={cancelMutation.isPending}
              >
                Yes, Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
