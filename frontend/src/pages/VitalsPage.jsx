import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Plus, Heart, Activity, Scale, Thermometer } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { formatDate } from '../utils/formatDate';
import { cn } from '../utils/cn';

const vitalSchema = z.object({
  heartRate: z.number().min(30).max(250).optional().or(z.literal('')),
  bloodPressure: z.string().regex(/^\d{2,3}\/\d{2,3}$/, 'Must be in format 120/80').optional().or(z.literal('')),
  weight: z.number().min(1).max(500).optional().or(z.literal('')),
  temperature: z.number().min(90).max(110).optional().or(z.literal('')),
});

export default function VitalsPage() {
  const user = useAuthStore(state => state.user);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: vitalsData, refetch } = useQuery({
    queryKey: ['vitals', user?.id],
    queryFn: async () => {
      const { data } = await api.get(`/vitals/${user?.id}/history`);
      return data.data;
    },
    enabled: !!user?.id,
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(vitalSchema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = { patientId: user.id };
      if (data.heartRate) payload.heartRate = Number(data.heartRate);
      if (data.bloodPressure) payload.bloodPressure = data.bloodPressure;
      if (data.weight) payload.weight = Number(data.weight);
      if (data.temperature) payload.temperature = Number(data.temperature);

      await api.post('/vitals/record', payload);
      toast.success('Vitals recorded successfully');
      setShowModal(false);
      reset();
      refetch();
    } catch (error) {
      toast.error('Failed to record vitals');
    } finally {
      setIsSubmitting(false);
    }
  };

  const chartData = vitalsData?.vitals?.map(v => {
    let systolic = null;
    let diastolic = null;
    if (v.bloodPressure && v.bloodPressure.includes('/')) {
      const parts = v.bloodPressure.split('/');
      systolic = parseInt(parts[0]);
      diastolic = parseInt(parts[1]);
    }
    return {
      date: formatDate(v.recordedAt, 'MMM dd'),
      heartRate: v.heartRate,
      weight: v.weight,
      temperature: v.temperature,
      systolic,
      diastolic,
    };
  }).reverse() || [];

  const hasChartData = chartData.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Health & Vitals</h1>
          <p className="text-gray-600 mt-1">Track your health metrics over time</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Reading
        </Button>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4 border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
            <Heart className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Latest Heart Rate</p>
            <p className="text-2xl font-bold text-gray-900">
              {vitalsData?.vitals?.[0]?.heartRate ? `${vitalsData.vitals[0].heartRate} bpm` : '--'}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
            <Activity className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Latest BP</p>
            <p className="text-2xl font-bold text-gray-900">
              {vitalsData?.vitals?.[0]?.bloodPressure || '--'}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
            <Scale className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Latest Weight</p>
            <p className="text-2xl font-bold text-gray-900">
              {vitalsData?.vitals?.[0]?.weight ? `${vitalsData.vitals[0].weight} lbs` : '--'}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
            <Thermometer className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Temperature</p>
            <p className="text-2xl font-bold text-gray-900">
              {vitalsData?.vitals?.[0]?.temperature ? `${vitalsData.vitals[0].temperature}°F` : '--'}
            </p>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Heart Rate Chart */}
        <Card className="pt-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4 px-2 flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500 animate-pulse" /> Heart Rate History
          </h2>
          <div className="h-56 w-full">
            {chartData.some(d => d.heartRate !== null) ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} dx={-5} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="heartRate" name="Heart Rate (bpm)" stroke="#EF4444" strokeWidth={2.5} connectNulls dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                No heart rate data recorded
              </div>
            )}
          </div>
        </Card>

        {/* Blood Pressure Chart */}
        <Card className="pt-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4 px-2 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" /> Blood Pressure History
          </h2>
          <div className="h-56 w-full">
            {chartData.some(d => d.systolic !== null) ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} dx={-5} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="top" height={24} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                  <Line type="monotone" dataKey="systolic" name="Systolic (mmHg)" stroke="#3B82F6" strokeWidth={2.5} connectNulls dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="diastolic" name="Diastolic (mmHg)" stroke="#60A5FA" strokeWidth={2.5} connectNulls dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                No blood pressure data recorded
              </div>
            )}
          </div>
        </Card>

        {/* Weight Chart */}
        <Card className="pt-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4 px-2 flex items-center gap-2">
            <Scale className="h-5 w-5 text-emerald-500" /> Weight History
          </h2>
          <div className="h-56 w-full">
            {chartData.some(d => d.weight !== null) ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} dx={-5} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="weight" name="Weight (lbs)" stroke="#10B981" strokeWidth={2.5} connectNulls dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                No weight data recorded
              </div>
            )}
          </div>
        </Card>

        {/* Temperature Chart */}
        <Card className="pt-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4 px-2 flex items-center gap-2">
            <Thermometer className="h-5 w-5 text-amber-500" /> Temperature History
          </h2>
          <div className="h-56 w-full">
            {chartData.some(d => d.temperature !== null) ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} dx={-5} domain={[95, 105]} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="temperature" name="Temp (°F)" stroke="#F59E0B" strokeWidth={2.5} connectNulls dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                No temperature data recorded
              </div>
            )}
          </div>
        </Card>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Record Vitals</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Heart Rate (bpm)"
                type="number"
                {...register('heartRate', { valueAsNumber: true })}
                error={errors.heartRate?.message}
              />
              <Input
                label="Blood Pressure (e.g., 120/80)"
                type="text"
                {...register('bloodPressure')}
                error={errors.bloodPressure?.message}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Weight (lbs)"
                  type="number"
                  step="0.1"
                  {...register('weight', { valueAsNumber: true })}
                  error={errors.weight?.message}
                />
                <Input
                  label="Temperature (°F)"
                  type="number"
                  step="0.1"
                  {...register('temperature', { valueAsNumber: true })}
                  error={errors.temperature?.message}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" isLoading={isSubmitting}>
                  Save Reading
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
