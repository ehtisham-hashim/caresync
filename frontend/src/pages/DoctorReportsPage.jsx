import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorService } from '../services/doctorService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import { FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { formatDate } from '../utils/formatDate';
import toast from 'react-hot-toast';

export default function DoctorReportsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('pending'); // 'pending' | 'all'
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['doctor-reports', filter, page],
    queryFn: () => {
      if (filter === 'pending') {
        return doctorService.getPendingReports(page, 20);
      }
      return doctorService.getAllReports(page, 20);
    },
  });

  const reviewMutation = useMutation({
    mutationFn: doctorService.reviewReport,
    onSuccess: () => {
      toast.success('Report marked as reviewed');
      queryClient.invalidateQueries(['doctor-reports']);
      queryClient.invalidateQueries(['doctor-dashboard']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to review report');
    },
  });

  const reports = data?.data?.reports || [];
  const total = data?.data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  const getSeverityColor = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'SEVERE':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MODERATE':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MILD':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patient Reports</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review symptom reports submitted by your patients
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <Card>
        <div className="flex space-x-2">
          <Button
            variant={filter === 'pending' ? 'primary' : 'outline'}
            onClick={() => {
              setFilter('pending');
              setPage(1);
            }}
          >
            <Clock className="h-4 w-4 mr-2" />
            Pending ({data?.data?.total || 0})
          </Button>
          <Button
            variant={filter === 'all' ? 'primary' : 'outline'}
            onClick={() => {
              setFilter('all');
              setPage(1);
            }}
          >
            <FileText className="h-4 w-4 mr-2" />
            All Reports
          </Button>
        </div>
      </Card>

      {/* Reports List */}
      {isLoading ? (
        <Loader size="lg" />
      ) : reports.length > 0 ? (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card
              key={report.id}
              className="hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {report.patient?.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {report.patient?.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(report.severity)}`}>
                        {report.severity}
                      </span>
                      {report.isReviewed ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Reviewed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Symptoms */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Symptoms:</p>
                    <p className="text-sm text-gray-600">{report.symptoms}</p>
                  </div>

                  {/* Notes */}
                  {report.notes && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Additional Notes:</p>
                      <p className="text-sm text-gray-600">{report.notes}</p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Submitted: {formatDate(report.createdAt)}
                    </p>
                    {!report.isReviewed && (
                      <Button
                        size="sm"
                        onClick={() => reviewMutation.mutate(report.id)}
                        isLoading={reviewMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark as Reviewed
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
            <p className="text-sm text-gray-500">
              {filter === 'pending' 
                ? 'All patient reports have been reviewed' 
                : 'No reports submitted yet'}
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
            <span className="font-medium">{total}</span> reports
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
