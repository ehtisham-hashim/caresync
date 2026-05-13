import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { scribeService } from '../services/scribeService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import { FileText, User, Calendar } from 'lucide-react';
import { formatDate } from '../utils/formatDate';

export default function DoctorVisitsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patientId');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: patientId ? ['patient-visits', patientId, page] : ['doctor-visits', page],
    queryFn: () => {
      if (patientId) {
        return scribeService.getPatientVisits(patientId, page, 20);
      }
      return scribeService.getDoctorVisits(page, 20);
    },
  });

  const visits = data?.data?.visits || [];
  const total = data?.data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {patientId ? 'Patient Visits' : 'All Visits'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage consultation records
          </p>
        </div>
        {patientId && (
          <Button
            variant="outline"
            onClick={() => navigate('/provider/visits')}
          >
            View All Visits
          </Button>
        )}
      </div>

      {/* Visits List */}
      {isLoading ? (
        <Loader size="lg" />
      ) : visits.length > 0 ? (
        <div className="space-y-4">
          {visits.map((visit) => (
            <Card
              key={visit.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/provider/visits/${visit.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {/* Icon */}
                  <div className="shrink-0">
                    <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>

                  {/* Visit Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {visit.patient?.name || 'Unknown Patient'}
                      </h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(visit.createdAt, 'date')}
                      </span>
                    </div>

                    {/* Assessment Preview */}
                    {visit.assessment && (
                      <div className="mb-2">
                        <p className="text-sm font-medium text-gray-700">Assessment:</p>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {visit.assessment}
                        </p>
                      </div>
                    )}

                    {/* Subjective Preview */}
                    {visit.subjective && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Subjective:</p>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {visit.subjective}
                        </p>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                      Visit ID: {visit.id.slice(0, 8)}...
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/provider/visits/${visit.id}`);
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
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No visits found</h3>
            <p className="text-sm text-gray-500">
              {patientId 
                ? 'No visits recorded for this patient yet' 
                : 'Start recording patient consultations to see them here'}
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
            <span className="font-medium">{total}</span> visits
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
