import { useQuery } from '@tanstack/react-query';
import { FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { formatDateTime } from '../../utils/formatDate';

export default function DoctorReports() {
  const { data: reportsData, refetch, isLoading, isError, error } = useQuery({
    queryKey: ['doctor-reports'],
    queryFn: async () => {
      const { data } = await api.get('/reports/doctor');
      return data.data;
    },
  });

  const reports = reportsData?.reports || [];

  const handleUpdateStatus = async (id) => {
    try {
      await api.put(`/reports/${id}/review`);
      toast.success('Report marked as reviewed');
      refetch();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (isLoading) return <div className="text-center py-12">Loading reports...</div>;
  if (isError) return (
    <div className="text-center py-12 text-red-600">
      <AlertCircle className="h-12 w-12 mx-auto mb-3" />
      <p>Error loading reports: {error?.message}</p>
      <Button onClick={() => refetch()} variant="outline" className="mt-4">Try Again</Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Patient Reports</h1>
        <p className="text-gray-600 mt-1">Review incoming symptom reports from your patients</p>
      </div>

      <div className="space-y-4">
        {reports?.length > 0 ? (
          reports.map(report => (
            <Card key={report.id} className={`border-l-4 ${
              report.severity === 'SEVERE' ? 'border-l-red-500' :
              report.severity === 'MODERATE' ? 'border-l-amber-500' :
              'border-l-blue-500'
            }`}>
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{report.patient?.name || 'Unknown Patient'}</h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase
                      ${report.severity === 'SEVERE' ? 'bg-red-100 text-red-700' :
                        report.severity === 'MODERATE' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'}
                    `}>
                      {report.severity}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase
                      ${report.isReviewed ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}
                    `}>
                      {report.isReviewed ? 'REVIEWED' : 'PENDING'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mt-4 text-sm text-gray-700">
                    <p><strong>Symptoms:</strong> {report.symptoms}</p>
                    {report.notes && <p><strong>Notes:</strong> {report.notes}</p>}
                    <p className="text-gray-500 text-xs flex items-center gap-1 mt-2">
                      <Clock className="h-3 w-3" /> Submitted: {formatDateTime(report.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start md:justify-end gap-2 shrink-0">
                  {!report.isReviewed && (
                    <Button onClick={() => handleUpdateStatus(report.id)} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                      <CheckCircle className="h-4 w-4 mr-2" /> Mark Reviewed
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => toast('Messaging feature coming soon!', { icon: '💬' })}>
                    Contact Patient
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200 border-dashed">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium text-gray-900">No pending reports</p>
            <p className="text-sm">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}
