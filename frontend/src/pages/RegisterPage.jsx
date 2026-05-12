import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/useAuthStore';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['PATIENT', 'DOCTOR']),
  dateOfBirth: z.string().optional(),
});

export default function RegisterPage() {
  const navigate = useNavigate();
  const registerAction = useAuthStore((state) => state.register);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'PATIENT',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await registerAction(data);
      if (response.success) {
        toast.success('Registration successful!');
        const role = response.data.user.role;
        navigate(role === 'DOCTOR' ? '/provider/dashboard' : '/dashboard');
      } else {
        toast.error(response.message || 'Registration failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create an account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-lg sm:px-10 border border-gray-200">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            
            <div className="flex gap-4 mb-4">
              <button
                type="button"
                onClick={() => setValue('role', 'PATIENT')}
                className={`flex-1 py-2 px-4 rounded-lg border ${
                  selectedRole === 'PATIENT' 
                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium' 
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Patient
              </button>
              <button
                type="button"
                onClick={() => setValue('role', 'DOCTOR')}
                className={`flex-1 py-2 px-4 rounded-lg border ${
                  selectedRole === 'DOCTOR' 
                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium' 
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Doctor
              </button>
            </div>

            <Input
              label="Full Name"
              type="text"
              {...register('name')}
              error={errors.name?.message}
            />

            <Input
              label="Email address"
              type="email"
              {...register('email')}
              error={errors.email?.message}
            />

            <Input
              label="Password"
              type="password"
              {...register('password')}
              error={errors.password?.message}
            />

            {selectedRole === 'PATIENT' && (
              <Input
                label="Date of Birth (Optional)"
                type="date"
                {...register('dateOfBirth')}
                error={errors.dateOfBirth?.message}
              />
            )}

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Sign up
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
