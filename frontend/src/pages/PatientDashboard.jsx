import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Calendar, Activity, Pill, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { getAccessToken } from '../services/api';
import toast from 'react-hot-toast';

const appointmentSchema = z.object({
  doctorId: z.string().min(1, 'Please select a doctor'),
  scheduledAt: z.string().min(1, 'Please select a date and time'),
  reason: z.string().min(1, 'Please provide a reason for the visit'),
});

export default function PatientDashboard() {
  const user = useAuthStore((state) => state.user);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(appointmentSchema),
  });

  const { data: appointmentsData, refetch } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const { data } = await api.get('/appointments?limit=3');
      return data.data;
    },
    retry: false,
  });

  const { data: doctorsData } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const { data } = await api.get('/users/doctors');
      return data.data;
    },
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

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const nextAppointment = appointmentsData?.appointments?.find(apt => {
    if (apt.status === 'COMPLETED' || apt.status === 'CANCELLED') {
      return false;
    }
    const aptDate = new Date(apt.scheduledAt);
    return aptDate >= todayStart;
  });

  const quickActions = [
    { title: 'Book Appointment', icon: Calendar, onClick: () => setShowModal(true), color: 'bg-blue-100 text-blue-600' },
    { title: 'Track Vitals', icon: Activity, href: '/health/vitals', color: 'bg-emerald-100 text-emerald-600' },
    { title: 'Prescriptions', icon: Pill, href: '/health/prescriptions', color: 'bg-violet-100 text-violet-600' },
    { title: 'AI Companion', icon: MessageCircle, href: '/chat', color: 'bg-pink-100 text-pink-600' },
  ];

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-5 bg-[#1976d2] rounded-full"></div>
        <div>
          <h2 className="text-xl font-bold text-[#2c3e50]">
            Welcome back, {user?.name?.split(' ')[0]}
          </h2>
          <p className="text-sm text-gray-500 mt-1">Here's your health overview</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            if (action.onClick) {
              return (
                <button 
                  key={action.title} 
                  onClick={action.onClick} 
                  className="w-full text-left focus:outline-none"
                >
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow text-center flex flex-col items-center justify-center h-full">
                    <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-3 mx-auto`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className="font-semibold text-[#2c3e50]">{action.title}</p>
                  </div>
                </button>
              );
            }
            return (
              <Link key={action.title} to={action.href}>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow text-center flex flex-col items-center justify-center h-full">
                  <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-3 mx-auto`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="font-semibold text-[#2c3e50]">{action.title}</p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-[#2c3e50] mb-4">Next Appointment</h3>
            {nextAppointment ? (
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="font-bold text-[#2c3e50]">{nextAppointment.doctor?.name || 'Doctor'}</p>
                <p className="text-sm text-gray-500">{nextAppointment.reason || 'Appointment'}</p>
                <div className="mt-2 text-sm font-bold text-[#1976d2]">
                  {new Date(nextAppointment.scheduledAt).toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p className="text-sm">No upcoming appointments</p>
                <button 
                  onClick={() => setShowModal(true)} 
                  className="text-[#1976d2] font-bold text-sm mt-2 inline-block hover:underline focus:outline-none"
                >
                  Book an appointment
                </button>
              </div>
            )}
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-[#2c3e50] mb-4">Active Prescriptions</h3>
            {prescriptionsData?.prescriptions?.length > 0 ? (
              <div className="space-y-3">
                {prescriptionsData.prescriptions.map((rx) => (
                  <div key={rx.id} className="bg-white rounded-xl p-3 border border-gray-200 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-[#2c3e50]">{rx.medicineName}</p>
                      <p className="text-sm text-gray-500">{rx.dosage}</p>
                    </div>
                    <span className="text-xs font-bold text-violet-600 bg-violet-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {rx.frequency}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p className="text-sm">No active prescriptions</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-[#2c3e50]">Book New Appointment</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Doctor</label>
                <select
                  {...register('doctorId')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
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
                <label className="block text-sm font-bold text-gray-700 mb-1">Reason for Visit</label>
                <textarea
                  {...register('reason')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
                  rows="3"
                ></textarea>
                {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason.message}</p>}
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-[#1976d2] hover:bg-[#1565c0]" isLoading={isSubmitting}>
                  Book
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
