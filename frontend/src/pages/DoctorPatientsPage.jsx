import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { doctorService } from '../services/doctorService';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import { Search, User, Heart, Pill, AlertCircle } from 'lucide-react';
import { formatDate } from '../utils/formatDate';

export default function DoctorPatientsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['doctor-patients', page, search],
    queryFn: () => doctorService.getMyPatients(page, 20, search),
  });

  const patients = data?.data?.patients || [];
  const total = data?.data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Patients</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and view your assigned patients
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full"
            />
          </div>
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>
      </Card>

      {/* Patients List */}
      {isLoading ? (
        <Loader size="lg" />
      ) : patients.length > 0 ? (
        <div className="space-y-4">
          {patients.map((patient) => (
            <Card
              key={patient.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/provider/patients/${patient.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {/* Avatar */}
                  <div className="shrink-0">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>

                  {/* Patient Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {patient.name}
                      </h3>
                      {patient.bloodGroup && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          {patient.bloodGroup}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{patient.email}</p>
                    
                    {/* Medical Info */}
                    <div className="mt-3 flex flex-wrap gap-4">
                      {patient.dateOfBirth && (
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="h-4 w-4 mr-1" />
                          Age: {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()}
                        </div>
                      )}
                      {patient.vitals?.[0] && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Heart className="h-4 w-4 mr-1" />
                          BP: {patient.vitals[0].bloodPressure || 'N/A'}
                        </div>
                      )}
                      {patient.prescriptions?.length > 0 && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Pill className="h-4 w-4 mr-1" />
                          {patient.prescriptions.length} Active Prescriptions
                        </div>
                      )}
                      {patient.allergies?.length > 0 && (
                        <div className="flex items-center text-sm text-red-600">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {patient.allergies.length} Allergies
                        </div>
                      )}
                    </div>

                    {/* Medical History */}
                    {patient.medicalHistory?.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">Medical History:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {patient.medicalHistory.map((condition, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                            >
                              {condition}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/provider/patients/${patient.id}`);
                  }}
                >
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
            <p className="text-sm text-gray-500">
              {search ? 'Try adjusting your search criteria' : 'No patients assigned yet'}
            </p>
          </div>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{(page - 1) * 20 + 1}</span> to{' '}
            <span className="font-medium">{Math.min(page * 20, total)}</span> of{' '}
            <span className="font-medium">{total}</span> patients
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
