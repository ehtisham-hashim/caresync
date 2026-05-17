import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { scribeService } from '../services/scribeService';
import api from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import { 
  FileText, 
  User, 
  Calendar, 
  Languages, 
  Pill, 
  FileCheck, 
  Heart, 
  Sparkles, 
  X, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { formatDate } from '../utils/formatDate';
import toast from 'react-hot-toast';

export default function PatientVisitsPage() {
  const user = useAuthStore((state) => state.user);
  const [selectedVisitId, setSelectedVisitId] = useState(null);
  const [page, setPage] = useState(1);
  
  // Translation state
  const [targetLanguage, setTargetLanguage] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  // Fetch the patient's visits list
  const { data: visitsData, isLoading: isLoadingVisits } = useQuery({
    queryKey: ['patient-visits', user?.id, page],
    queryFn: () => scribeService.getPatientVisits(user?.id, page, 10),
    enabled: !!user?.id,
  });

  // Fetch specific visit detail when a visit is selected
  const { data: visitDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['visit-detail', selectedVisitId],
    queryFn: async () => {
      const response = await scribeService.getVisitDetail(selectedVisitId);
      return response.data;
    },
    enabled: !!selectedVisitId,
  });

  const visits = visitsData?.data?.visits || [];
  const total = visitsData?.data?.total || 0;
  const totalPages = Math.ceil(total / 10);

  // Handle translation
  const handleTranslate = async (lang) => {
    if (!lang) {
      setTargetLanguage('');
      setTranslatedText('');
      return;
    }
    
    setTargetLanguage(lang);
    setIsTranslating(true);
    
    try {
      // We will translate the doctor's plan/instructions
      const planText = visitDetail?.plan || 'No instructions provided.';
      const assessmentText = visitDetail?.assessment || '';
      const textToTranslate = `Doctor's Diagnosis: ${assessmentText}\n\nDoctor's Treatment Plan & Instructions: ${planText}`;

      const { data } = await api.post('/chat/translate', {
        text: textToTranslate,
        targetLanguage: lang,
      });

      setTranslatedText(data.data.translation);
      toast.success(`Translated to ${lang}!`);
    } catch (error) {
      toast.error('AI translation failed. Please try again.');
      setTargetLanguage('');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleOpenDetailModal = (visitId) => {
    setSelectedVisitId(visitId);
    setTargetLanguage('');
    setTranslatedText('');
  };

  const handleCloseDetailModal = () => {
    setSelectedVisitId(null);
    setTargetLanguage('');
    setTranslatedText('');
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            My Visit History
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            View detailed summaries, diagnoses, and translation of past doctor consultations.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoadingVisits ? (
        <div className="flex justify-center py-20">
          <Loader size="lg" />
        </div>
      ) : visits.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {visits.map((visit) => (
            <Card
              key={visit.id}
              className="group border border-gray-100 hover:border-blue-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                {/* Visit Summary Card Header */}
                <div className="flex items-start justify-between border-b border-gray-100 pb-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                      {visit.doctor?.name?.charAt(0) || 'D'}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        Dr. {visit.doctor?.name || 'Unknown Doctor'}
                      </h3>
                      <p className="text-xs text-gray-500">CareSync Consulting Provider</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    {formatDate(visit.createdAt, 'date')}
                  </span>
                </div>

                {/* Card Content Previews */}
                <div className="space-y-3">
                  {visit.assessment && (
                    <div className="bg-gray-50/50 rounded-lg p-3 border border-gray-100">
                      <div className="flex items-center space-x-1.5 text-xs font-semibold text-gray-700 mb-1">
                        <Heart className="h-3.5 w-3.5 text-red-500" />
                        <span>Clinical Assessment & Diagnosis</span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {visit.assessment}
                      </p>
                    </div>
                  )}
                  {visit.plan && (
                    <div>
                      <span className="text-xs font-semibold text-gray-500">Treatment Plan Overview</span>
                      <p className="text-sm text-gray-600 mt-0.5 line-clamp-2 italic">
                        "{visit.plan}"
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* View Action */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  Visit ID: #{visit.id.slice(0, 8)}
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleOpenDetailModal(visit.id)}
                  className="shadow-sm hover:shadow-md transition-shadow"
                >
                  View Details & Instructions
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-2 border-gray-200">
          <div className="text-center py-16">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">No Visit Records Found</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Once you complete consultations with CareSync doctors, your AI-scribed summaries and instructions will be available here.
            </p>
          </div>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 bg-white px-4 py-3 rounded-xl border border-gray-100">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold">{(page - 1) * 10 + 1}</span> to{' '}
            <span className="font-semibold">{Math.min(page * 10, total)}</span> of{' '}
            <span className="font-semibold">{total}</span> visits
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

      {/* Premium Glassmorphic Detail Modal */}
      {selectedVisitId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  <FileCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Consultation Instructions
                  </h2>
                  <p className="text-xs text-gray-500">
                    Dr. {visitDetail?.doctor?.name || 'CareSync Provider'} • {visitDetail && formatDate(visitDetail.createdAt, 'full')}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseDetailModal}
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
                  {/* AI Translation Module */}
                  <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-100/50 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 rounded-lg bg-violet-100 text-violet-700">
                          <Languages className="h-5 w-5 animate-pulse" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 flex items-center gap-1.5 text-sm sm:text-base">
                            Translate Instructions <Sparkles className="h-4 w-4 text-amber-500" />
                          </h4>
                          <p className="text-xs text-gray-500">
                            Translate diagnoses and steps into your native language.
                          </p>
                        </div>
                      </div>
                      
                      {/* Language Select Dropdown */}
                      <select
                        value={targetLanguage}
                        onChange={(e) => handleTranslate(e.target.value)}
                        className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer shadow-sm min-w-[150px]"
                      >
                        <option value="">Original (English)</option>
                        <option value="Urdu">Urdu (اردو)</option>
                        <option value="Hindi">Hindi (हिन्दी)</option>
                        <option value="Arabic">Arabic (العربية)</option>
                        <option value="Spanish">Spanish (Español)</option>
                      </select>
                    </div>

                    {/* Display Translation with micro-animations */}
                    {isTranslating && (
                      <div className="mt-4 py-6 border-t border-violet-100 flex flex-col items-center justify-center space-y-2">
                        <Loader size="sm" />
                        <p className="text-xs text-violet-600 font-semibold animate-pulse">
                          AI is translating medical instructions...
                        </p>
                      </div>
                    )}

                    {!isTranslating && translatedText && (
                      <div className="mt-4 p-4 bg-white rounded-lg border border-violet-100 shadow-inner animate-fadeIn">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] uppercase font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded">
                            {targetLanguage} Translation
                          </span>
                          <span className="text-xs text-gray-400 font-medium">Powered by Gemini AI</span>
                        </div>
                        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                          {translatedText}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Diagnoses Section (Assessment) */}
                  {visitDetail?.assessment && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Heart className="h-4 w-4 text-red-500" /> Diagnosis & Assessment
                      </h4>
                      <div className="bg-red-50/20 p-4 rounded-xl border border-red-100/50">
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {visitDetail.assessment}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Treatment Plan Section (Plan) */}
                  {visitDetail?.plan && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-blue-500" /> Doctor's Plan & Instructions
                      </h4>
                      <div className="bg-blue-50/20 p-4 rounded-xl border border-blue-100/50">
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                          {visitDetail.plan}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Prescribed Medicines (Option 3 integration!) */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Pill className="h-4 w-4 text-indigo-500" /> Prescribed Medications
                    </h4>
                    {visitDetail?.prescriptions?.length > 0 ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {visitDetail.prescriptions.map((rx) => (
                          <div 
                            key={rx.id} 
                            className="bg-indigo-50/10 p-4 rounded-xl border border-indigo-100/50 flex flex-col justify-between space-y-2 hover:shadow-sm transition-shadow"
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
                            
                            {/* Simplified Instructions by AI */}
                            {rx.simplifiedInstructions && (
                              <div className="mt-2 pt-2 border-t border-indigo-100/20 bg-indigo-50/20 p-2 rounded text-xs text-indigo-900">
                                <span className="font-bold block text-[10px] uppercase text-indigo-700 mb-0.5">Simple Instructions:</span>
                                {rx.simplifiedInstructions}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-center text-xs text-gray-500">
                        No specific medications were formally registered in this visit.
                      </div>
                    )}
                  </div>

                  {/* Medical Terms Tap-to-Explain Section */}
                  {visitDetail?.medicalTerms && JSON.parse(JSON.stringify(visitDetail.medicalTerms)).length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4 text-emerald-500" /> Health Terminology Guide
                      </h4>
                      <div className="bg-emerald-50/10 p-4 rounded-xl border border-emerald-100/50">
                        <p className="text-xs text-gray-500 mb-3">
                          Tap or read definitions of medical jargon discussed in your consult:
                        </p>
                        <div className="grid gap-2.5 sm:grid-cols-2">
                          {JSON.parse(JSON.stringify(visitDetail.medicalTerms)).map((termObj, index) => (
                            <div key={index} className="p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                              <span className="font-bold text-xs text-emerald-700 block">{termObj.term}</span>
                              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                {termObj.meaning}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SOAP subjective & objective details */}
                  <div className="border-t border-gray-100 pt-6 space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Detailed Scribe Consult Logs
                    </h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {visitDetail?.subjective && (
                        <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                          <span className="font-bold text-xs text-gray-700 block mb-1">Subjective (My symptoms & history)</span>
                          <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {visitDetail.subjective}
                          </p>
                        </div>
                      )}
                      {visitDetail?.objective && (
                        <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                          <span className="font-bold text-xs text-gray-700 block mb-1">Objective (Observable & Vitals)</span>
                          <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {visitDetail.objective}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
              <Button variant="outline" size="sm" onClick={handleCloseDetailModal}>
                Close Instructions
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
