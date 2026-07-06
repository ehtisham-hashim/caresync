import { useQuery } from '@tanstack/react-query';
import { getDoctorsWithPatients } from '../../services/adminService';
import Loader from '../../components/common/Loader';
import { User, Activity, Mail } from 'lucide-react';

export default function AdminDoctorAssignments() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['adminDoctorsWithPatients'],
    queryFn: getDoctorsWithPatients,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        Error loading data: {error.message}
      </div>
    );
  }

  const doctors = data?.data?.doctors || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Doctor Assignments</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of all doctors and their assigned patients.
        </p>
      </div>

      <div className="space-y-6">
        {doctors.length === 0 ? (
          <div className="p-6 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
            No doctors found.
          </div>
        ) : (
          doctors.map((doctor) => (
            <div key={doctor.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{doctor.name}</h2>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {doctor.email}
                        </span>
                        {doctor.doctorProfile?.specialization && (
                          <span className="flex items-center gap-1">
                            <Activity className="h-4 w-4" />
                            {doctor.doctorProfile.specialization}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                      {doctor.patients?.length || 0} Patients
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Assigned Patients</h3>
                {(!doctor.patients || doctor.patients.length === 0) ? (
                  <p className="text-sm text-gray-500 italic">No patients assigned yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {doctor.patients.map((patient) => (
                      <div key={patient.id} className="p-4 rounded-lg border border-gray-100 bg-gray-50 flex flex-col gap-2">
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                           <User className="h-4 w-4 text-gray-400" />
                           {patient.name}
                        </div>
                        <div className="text-xs text-gray-500 flex flex-col gap-1">
                           <span>{patient.email}</span>
                           {patient.bloodGroup && (
                             <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10 w-fit">
                               Blood Group: {patient.bloodGroup}
                             </span>
                           )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
