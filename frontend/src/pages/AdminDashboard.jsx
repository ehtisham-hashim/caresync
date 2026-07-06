import { useEffect, useState } from 'react';
import axios from 'axios';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Loader from '../components/common/Loader';
import { Users, BarChart3, Plus, Edit3, Trash2, CalendarDays, Activity } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export default function AdminDashboard() {
  const [view, setView] = useState('doctors');
  const [doctors, setDoctors] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [form, setForm] = useState({
    id: '',
    email: '',
    password: '',
    name: '',
    specialization: '',
    licenseNumber: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [doctorsRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/admin/doctors`, {
          params: { adminEmail: loginForm.email, adminPassword: loginForm.password },
        }),
        axios.get(`${API_BASE_URL}/admin/stats`, {
          params: { adminEmail: loginForm.email, adminPassword: loginForm.password },
        }),
      ]);
      setDoctors(doctorsRes?.data?.data || []);
      setStats(statsRes?.data?.data || []);
    } catch (err) {
      setError('Unable to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleAdminLogin = async (e) => {
    if (e?.preventDefault) {
      e.preventDefault();
    }

    setError('');
    setSuccess('');
    setLoginLoading(true);

    try {
      await axios.post(`${API_BASE_URL}/admin/login`, {
        email: loginForm.email,
        password: loginForm.password,
      });
      setIsAuthenticated(true);
      setSuccess('Admin login successful.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid admin credentials.');
      setIsAuthenticated(false);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (isEditing) {
        await axios.patch(`${API_BASE_URL}/admin/doctors/${form.id}`, {
          name: form.name,
          specialization: form.specialization,
          licenseNumber: form.licenseNumber,
          email: form.email,
          password: loginForm.password,
        }, {
          params: { email: loginForm.email, password: loginForm.password },
        });
        setSuccess('Doctor updated successfully.');
      } else {
        await axios.post(`${API_BASE_URL}/admin/doctors`, {
          email: form.email,
          password: form.password,
          name: form.name,
          specialization: form.specialization,
          licenseNumber: form.licenseNumber,
          adminEmail: loginForm.email,
          adminPassword: loginForm.password,
        }, {
          params: { adminEmail: loginForm.email, adminPassword: loginForm.password },
        });
        setSuccess('Doctor added successfully.');
      }

      setForm({ id: '', email: '', password: '', name: '', specialization: '', licenseNumber: '' });
      setIsEditing(false);
      fetchData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong.');
    }
  };

  const handleEdit = (doctor) => {
    setForm({
      id: doctor.id,
      email: doctor.email || '',
      password: '',
      name: doctor.name || '',
      specialization: doctor.doctorProfile?.specialization || '',
      licenseNumber: doctor.doctorProfile?.licenseNumber || '',
    });
    setIsEditing(true);
    setView('doctors');
  };

  const handleDelete = async (doctorId) => {
    try {
      await axios.delete(`${API_BASE_URL}/admin/doctors/${doctorId}`, {
        params: { adminEmail: loginForm.email, adminPassword: loginForm.password },
      });
      setSuccess('Doctor deleted successfully.');
      fetchData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to delete doctor.');
    }
  };

  const resetForm = () => {
    setForm({ id: '', email: '', password: '', name: '', specialization: '', licenseNumber: '' });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {!isAuthenticated ? (
        <div className="mx-auto flex max-w-md items-center justify-center">
          <Card className="w-full">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
              <p className="mt-1 text-sm text-gray-500">Sign in with your admin email and password.</p>
            </div>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                placeholder="admin@example.com"
                required
              />
              <Input
                label="Password"
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                placeholder="Enter password"
                required
              />
              <Button
                type="submit"
                className="w-full"
                isLoading={loginLoading}
                onClick={handleAdminLogin}
              >
                Sign In
              </Button>
            </form>
          </Card>
        </div>
      ) : (
        <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row">
          <aside className="w-full lg:w-72">
          <Card className="p-0 overflow-hidden">
            <div className="border-b border-gray-100 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
                  <p className="text-sm text-gray-500">Doctor management</p>
                </div>
              </div>
            </div>
            <nav className="p-3 space-y-1">
              <button
                onClick={() => setView('doctors')}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${view === 'doctors' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Users className="h-4 w-4" />
                Doctors
              </button>
              <button
                onClick={() => setView('analytics')}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${view === 'analytics' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </button>
            </nav>
          </Card>
        </aside>

          <main className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {view === 'doctors' ? 'Doctor Management' : 'Doctor Analytics'}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {view === 'doctors'
                    ? 'Create, update, and remove doctors from the platform.'
                    : 'Track weekly and monthly appointment progress by doctor.'}
                </p>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {success}
              </div>
            )}

            {view === 'doctors' ? (
              <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <Card>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Doctors</h2>
                      <p className="text-sm text-gray-500">Manage physician accounts</p>
                    </div>
                    <Button variant="secondary" onClick={resetForm}>
                      <Plus className="mr-2 h-4 w-4" />
                      {isEditing ? 'Cancel Edit' : 'New Doctor'}
                    </Button>
                  </div>

                  {loading ? (
                    <Loader size="lg" />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead>
                          <tr className="text-left text-gray-500">
                            <th className="px-3 py-3 font-medium">Name</th>
                            <th className="px-3 py-3 font-medium">Email</th>
                            <th className="px-3 py-3 font-medium">Specialization</th>
                            <th className="px-3 py-3 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {doctors.length > 0 ? doctors.map((doctor) => (
                            <tr key={doctor.id} className="hover:bg-gray-50">
                              <td className="px-3 py-3 font-medium text-gray-900">{doctor.name}</td>
                              <td className="px-3 py-3 text-gray-600">{doctor.email}</td>
                              <td className="px-3 py-3 text-gray-600">
                                {doctor.doctorProfile?.specialization || '—'}
                              </td>
                              <td className="px-3 py-3">
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" onClick={() => handleEdit(doctor)}>
                                    <Edit3 className="mr-1 h-3 w-3" />
                                    Edit
                                  </Button>
                                  <Button variant="danger" size="sm" onClick={() => handleDelete(doctor.id)}>
                                    <Trash2 className="mr-1 h-3 w-3" />
                                    Delete
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan="4" className="px-3 py-8 text-center text-gray-500">
                                No doctors found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>

                <Card>
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {isEditing ? 'Update Doctor' : 'Add Doctor'}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {isEditing ? 'Modify doctor profile details.' : 'Create a new doctor account.'}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      label="Full Name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Dr. Jane Doe"
                      required
                    />
                    <Input
                      label="Email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="doctor@example.com"
                      required
                    />
                    {!isEditing && (
                      <Input
                        label="Temporary Password"
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="Create a secure password"
                        required
                      />
                    )}
                    <Input
                      label="Specialization"
                      value={form.specialization}
                      onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                      placeholder="Cardiology"
                    />
                    <Input
                      label="License Number"
                      value={form.licenseNumber}
                      onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                      placeholder="LIC-12345"
                    />
                    <div className="flex gap-3 pt-2">
                      <Button type="submit" className="flex-1">
                        {isEditing ? 'Update Doctor' : 'Add Doctor'}
                      </Button>
                      <Button type="button" variant="secondary" onClick={resetForm}>
                        Reset
                      </Button>
                    </div>
                  </form>
                </Card>
              </div>
            ) : (
              <div className="space-y-6">
                <Card>
                  <div className="mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Appointment Progress</h2>
                  </div>
                  {loading ? (
                    <Loader size="lg" />
                  ) : stats.length > 0 ? (
                    <div className="space-y-4">
                      {stats.map((item) => (
                        <div key={item.doctorId} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">{item.doctorName}</p>
                              <p className="text-sm text-gray-500">Weekly vs monthly activity</p>
                            </div>
                            <div className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                              {item.monthlyAppointments} this month
                            </div>
                          </div>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-xl bg-white p-4 shadow-sm">
                              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-600">
                                <CalendarDays className="h-4 w-4 text-green-600" />
                                Weekly
                              </div>
                              <p className="text-2xl font-bold text-gray-900">{item.weeklyAppointments}</p>
                            </div>
                            <div className="rounded-xl bg-white p-4 shadow-sm">
                              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-600">
                                <BarChart3 className="h-4 w-4 text-purple-600" />
                                Monthly
                              </div>
                              <p className="text-2xl font-bold text-gray-900">{item.monthlyAppointments}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 text-center text-gray-500">No appointment stats available.</div>
                  )}
                </Card>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
