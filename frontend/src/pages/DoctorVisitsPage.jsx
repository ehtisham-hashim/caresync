import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { scribeService } from '../services/scribeService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import { FileText, User, Calendar, X, Pill, Heart, Clock, AlertCircle } from 'lucide-react';
import { formatDate, formatDateTime } from '../utils/formatDate';

export default function DoctorVisitsPage() {
  const navigate = useNavigate();
  const { visitId } = useParams();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patientId');
  const [page, setPage] = useState(1);

  // Fetch specific visit details when visitId is present in URL
  const { data: visitDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['visit-detail', visitId],
    queryFn: async () => {
      const response = await scribeService.getVisitDetail(visitId);
      return response.data;
    },
    enabled: !!visitId,
  });

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
                        {formatDate(visit.createdAt)}
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

      {/* Premium Detail Modal for Doctor */}
      {visitId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  VT
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Visit Consultation Record
                  </h2>
                  <p className="text-xs text-gray-500">
                    Patient: {visitDetail?.patient?.name || 'Unknown Patient'} • {visitDetail && formatDateTime(visitDetail.createdAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate(patientId ? `/provider/visits?patientId=${patientId}` : '/provider/visits')}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {isLoadingDetail ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <Loader size="lg" />
                  <p className="text-sm text-gray-500 font-medium animate-pulse">
                    Retrieving clinical records...
                  </p>
                </div>
              ) : (
                <>
                  {/* SOAP fields */}
                  <div className="grid gap-6">
                    {visitDetail?.subjective && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                          <User className="h-4 w-4 text-blue-500" /> Subjective (Patient Complaints & Symptoms)
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                            {visitDetail.subjective}
                          </p>
                        </div>
                      </div>
                    )}

                    {visitDetail?.objective && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                          <AlertCircle className="h-4 w-4 text-orange-500" /> Objective (Clinical Observations & Vitals)
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                            {visitDetail.objective}
                          </p>
                        </div>
                      </div>
                    )}

                    {visitDetail?.assessment && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Heart className="h-4 w-4 text-red-500" /> Assessment (Clinical Diagnoses)
                        </h4>
                        <div className="bg-red-50/20 p-4 rounded-xl border border-red-100/50">
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {visitDetail.assessment}
                          </p>
                        </div>
                      </div>
                    )}

                    {visitDetail?.plan && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-green-500" /> Plan & Treatment Instructions
                        </h4>
                        <div className="bg-blue-50/20 p-4 rounded-xl border border-blue-100/50">
                          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                            {visitDetail.plan}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Prescribed Medicines */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Pill className="h-4 w-4 text-indigo-500" /> Prescribed Medications
                    </h4>
                    {visitDetail?.prescriptions?.length > 0 ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {visitDetail.prescriptions.map((rx) => (
                          <div 
                            key={rx.id} 
                            className="bg-indigo-50/10 p-4 rounded-xl border border-indigo-100/50 flex flex-col justify-between space-y-2"
                          >
                            <div>
                              <div className="flex justify-between items-start">
                                <span className="font-bold text-gray-900 text-sm">{rx.medicineName}</span>
                                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                                  {rx.duration}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 mt-1 font-medium">Dosage: {rx.dosage}</p>
                              <p className="text-xs text-gray-500">Frequency: {rx.frequency}</p>
                              {rx.notes && (
                                <p className="text-xs text-gray-400 mt-1 italic">
                                  "{rx.notes}"
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-center text-xs text-gray-500">
                        No specific medications were registered in this visit.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate(patientId ? `/provider/visits?patientId=${patientId}` : '/provider/visits')}
              >
                Close Record
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
