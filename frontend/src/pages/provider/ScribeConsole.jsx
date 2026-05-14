import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReactMediaRecorder } from 'react-media-recorder';
import { Mic, Square, Loader2, CheckCircle, FileText, Activity, Save } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';

export default function ScribeConsole() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [soapNotes, setSoapNotes] = useState(null);

  const { data: patient } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      const { data } = await api.get(`/users/${patientId}`);
      return data.data;
    },
    enabled: !!patientId,
  });

  const {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
    clearBlobUrl,
  } = useReactMediaRecorder({ audio: true });

  const handleProcessAudio = async () => {
    if (!mediaBlobUrl) return;
    setIsProcessing(true);
    setSoapNotes(null);

    try {
      const audioBlob = await fetch(mediaBlobUrl).then(r => r.blob());
      const formData = new FormData();
      formData.append('audio', audioBlob, 'visit_audio.webm');
      formData.append('patientId', patientId);

      const { data } = await api.post('/scribe/upload-audio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSoapNotes(data.data);
      toast.success('Audio processed successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process audio. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveNotes = async () => {
    // Already saved on backend during processing, but maybe we want to update it if edited
    toast.success('Visit notes finalized!');
    navigate('/provider/dashboard');
  };

  if (!patientId) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Patient ID Required</h2>
        <p className="text-gray-600 mt-2">Please select a patient from the directory first.</p>
        <Button onClick={() => navigate('/provider/patients')} className="mt-4">Go to Directory</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Medical Scribe</h1>
          <p className="text-gray-600">Patient: {patient?.name || 'Loading...'}</p>
        </div>
        <div className="flex items-center gap-3">
          {status === 'recording' ? (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1.5 rounded-full animate-pulse">
              <div className="w-2 h-2 bg-red-600 rounded-full" />
              <span className="font-medium text-sm">Recording...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
              <span className="font-medium text-sm capitalize">Status: {status}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recording Panel */}
        <Card className="flex flex-col items-center justify-center py-12 text-center space-y-6 h-full min-h-[300px]">
          {isProcessing ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
              <h3 className="text-xl font-semibold">Processing Audio...</h3>
              <p className="text-gray-500 mt-2 max-w-sm">
                Our AI is transcribing the conversation and generating structured SOAP notes.
              </p>
            </div>
          ) : !mediaBlobUrl ? (
            <>
              <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                status === 'recording' ? 'bg-red-100' : 'bg-blue-100'
              }`}>
                <Mic className={`h-10 w-10 ${status === 'recording' ? 'text-red-600' : 'text-blue-600'}`} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Record Visit</h3>
                <p className="text-gray-600 max-w-sm mx-auto">
                  Start recording the consultation. The AI will automatically structure your notes.
                </p>
              </div>
              <div className="flex gap-4">
                {status !== 'recording' ? (
                  <Button onClick={startRecording} className="bg-red-600 hover:bg-red-700 w-32">
                    Start
                  </Button>
                ) : (
                  <Button onClick={stopRecording} className="bg-gray-800 hover:bg-gray-900 w-32">
                    <Square className="h-4 w-4 mr-2" /> Stop
                  </Button>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Audio Recorded</h3>
                <audio src={mediaBlobUrl} controls className="mt-4 mb-2 w-full max-w-xs mx-auto" />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={clearBlobUrl}>Retake</Button>
                <Button onClick={handleProcessAudio} className="bg-blue-600">
                  Generate Notes
                </Button>
              </div>
            </>
          )}
        </Card>

        {/* Results Panel */}
        <Card className={`h-full flex flex-col ${!soapNotes ? 'items-center justify-center bg-gray-50/50' : ''}`}>
          {!soapNotes ? (
            <div className="text-center text-gray-400">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>SOAP notes will appear here<br/>after processing</p>
            </div>
          ) : (
            <div className="space-y-4 flex-1 overflow-y-auto pr-2">
              <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                <h3 className="text-lg font-bold text-gray-900">Generated SOAP Note</h3>
                <Button size="sm" onClick={handleSaveNotes}>
                  <Save className="h-4 w-4 mr-2" /> Finalize
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-blue-900 bg-blue-50 px-2 py-1 rounded w-fit mb-1">Subjective</h4>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{soapNotes.subjective}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-emerald-900 bg-emerald-50 px-2 py-1 rounded w-fit mb-1">Objective</h4>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{soapNotes.objective}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-amber-900 bg-amber-50 px-2 py-1 rounded w-fit mb-1">Assessment</h4>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{soapNotes.assessment}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-900 bg-purple-50 px-2 py-1 rounded w-fit mb-1">Plan</h4>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{soapNotes.plan}</p>
                </div>

                {soapNotes.medicalTerms?.length > 0 && (
                  <div className="pt-4 mt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-600" /> Extracted Medical Terms
                    </h4>
                    <div className="space-y-2">
                      {soapNotes.medicalTerms.map((term, i) => (
                        <div key={i} className="bg-gray-50 p-2 rounded border border-gray-100">
                          <span className="font-medium text-gray-900">{term.term}:</span>
                          <span className="text-gray-600 text-sm ml-2">{term.meaning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
