import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { doctorService } from '../services/doctorService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import { 
  ArrowLeft, User, Heart, AlertCircle, Pill, FileText, 
  Calendar, Phone, Activity 
} from 'lucide-react';
import { formatDate } from '../utils/formatDate';

export default function PatientDetailPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['patient-detail', patientId],
    queryFn: () => doctorService.getPatientDetail(patientId),
  });

  if (isLoading) {
    return <Loader size="lg" />;
  }

  const patient = data?.data;

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Patient not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/provider/patients')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{patient.name}</h1>
            <p className="mt-1 text-sm text-gray-500">{patient.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate(`/provider/scribe?patientId=${patientId}`)}>
            Start Visit
          </Button>
        </div>
      </div>

      {/* Patient Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Age</p>
              <p className="text-lg font-semibold text-gray-900">
                {patient.dateOfBirth 
                  ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()
                  : 'N/A'} years
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Heart className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Blood Group</p>
              <p className="text-lg font-semibold text-gray-900">
                {patient.bloodGroup || 'N/A'}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Allergies</p>
              <p className="text-lg font-semibold text-gray-900">
                {patient.allergies?.length || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Allergies */}
      {patient.allergies?.length > 0 && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
            Allergies
          </h2>
          <div className="space-y-2">
            {patient.allergies.map((allergy) => (
              <div
                key={allergy.id}
                className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{allergy.allergen}</p>
                  {allergy.reaction && (
                    <p className="text-sm text-gray-600">{allergy.reaction}</p>
                  )}
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  allergy.severity === 'SEVERE' ? 'bg-red-200 text-red-800' :
                  allergy.severity === 'MODERATE' ? 'bg-orange-200 text-orange-800' :
                  'bg-yellow-200 text-yellow-800'
                }`}>
                  {allergy.severity}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Medical History */}
      {patient.medicalHistory?.length > 0 && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Medical History</h2>
          <div className="flex flex-wrap gap-2">
            {patient.medicalHistory.map((condition, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 text-gray-700"
              >
                {condition}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Latest Vitals */}
      {patient.vitals?.length > 0 && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-blue-600" />
            Latest Vitals
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {patient.vitals[0].heartRate && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Heart Rate</p>
                <p className="text-lg font-semibold text-gray-900">{patient.vitals[0].heartRate} bpm</p>
              </div>
            )}
            {patient.vitals[0].bloodPressure && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Blood Pressure</p>
                <p className="text-lg font-semibold text-gray-900">{patient.vitals[0].bloodPressure}</p>
              </div>
            )}
            {patient.vitals[0].weight && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Weight</p>
                <p className="text-lg font-semibold text-gray-900">{patient.vitals[0].weight} kg</p>
              </div>
            )}
            {patient.vitals[0].temperature && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Temperature</p>
                <p className="text-lg font-semibold text-gray-900">{patient.vitals[0].temperature}°F</p>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Recorded: {formatDate(patient.vitals[0].recordedAt)}
          </p>
        </Card>
      )}

      {/* Emergency Contacts */}
      {patient.emergencyContacts?.length > 0 && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Phone className="h-5 w-5 mr-2 text-green-600" />
            Emergency Contacts
          </h2>
          <div className="space-y-3">
            {patient.emergencyContacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{contact.name}</p>
                  <p className="text-sm text-gray-600">{contact.relationship}</p>
                </div>
                <p className="text-sm font-medium text-gray-900">{contact.phoneNumber}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Visits */}
      {patient.patientVisits?.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-purple-600" />
              Recent Visits
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/provider/visits?patientId=${patientId}`)}
            >
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {patient.patientVisits.slice(0, 5).map((visit) => (
              <div key={visit.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(visit.createdAt)}
                    </p>
                    {visit.assessment && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {visit.assessment}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/provider/visits/${visit.id}`)}
                  >
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Active Prescriptions */}
      {patient.prescriptions?.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Pill className="h-5 w-5 mr-2 text-green-600" />
              Active Prescriptions
            </h2>
          </div>
          <div className="space-y-3">
            {patient.prescriptions.map((prescription) => (
              <div key={prescription.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{prescription.medicineName}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {prescription.dosage} • {prescription.frequency}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Duration: {prescription.duration}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(prescription.createdAt, 'date')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
