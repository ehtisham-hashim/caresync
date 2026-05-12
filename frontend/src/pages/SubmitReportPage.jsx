import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useQuery } from '@tanstack/react-query';

const reportSchema = z.object({
  doctorId: z.string().min(1, 'Please select a doctor'),
  symptoms: z.string().min(10, 'Please describe your symptoms (at least 10 characters)'),
  severity: z.enum(['MILD', 'MODERATE', 'SEVERE']),
  duration: z.string().min(1, 'Please specify how long you have had these symptoms'),
});

export default function SubmitReportPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: doctorsData } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const { data } = await api.get('/users/doctors');
      return data.data;
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      severity: 'MODERATE',
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        doctorId: data.doctorId,
        symptoms: data.symptoms,
        severity: data.severity,
        notes: `Duration: ${data.duration}`
      };
      await api.post('/reports', payload);
      toast.success('Report submitted successfully! Your doctor will review it soon.');
      reset();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Submit Health Update</h1>
        <p className="text-gray-600 mt-1">Report symptoms or health concerns to your doctor</p>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        <h3 className="font-semibold text-red-900">Emergency?</h3>
        <p className="text-sm mt-1">
          If you're experiencing a medical emergency, call 911 or go to the nearest emergency room immediately.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Doctor <span className="text-red-500">*</span>
            </label>
            <select
              {...register('doctorId')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Choose a doctor...</option>
              {doctorsData?.map(doctor => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} - {doctor.doctorProfile?.specialization || 'General'}
                </option>
              ))}
            </select>
            {errors.doctorId && <p className="mt-1 text-sm text-red-600">{errors.doctorId.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe Your Symptoms <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('symptoms')}
              rows="5"
              placeholder="Please describe what you're experiencing..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            />
            {errors.symptoms && <p className="mt-1 text-sm text-red-600">{errors.symptoms.message}</p>}
          </div>

          <Input
            label="How long have you had these symptoms?"
            placeholder="e.g., 3 days, 1 week"
            error={errors.duration?.message}
            {...register('duration')}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severity Level <span className="text-red-500">*</span>
            </label>
            <select
              {...register('severity')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            >
              <option value="MILD">Mild - Minor discomfort</option>
              <option value="MODERATE">Moderate - Noticeable symptoms</option>
              <option value="SEVERE">Severe - Significant concern</option>
            </select>
            {errors.severity && <p className="mt-1 text-sm text-red-600">{errors.severity.message}</p>}
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Submit Report
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
