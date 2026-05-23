import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useReactMediaRecorder } from 'react-media-recorder';
import { Mic, Square, Loader2, CheckCircle, FileText, Activity, Save, Languages } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';

export default function ScribeConsole() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');
  const [isProcessing, setIsProcessing] = useState(false);
  const [soapNotes, setSoapNotes] = useState(null);

  // Live Speech Recognition States
  const [liveCaptions, setLiveCaptions] = useState('');
  const [interimCaption, setInterimCaption] = useState('');
  const [recognitionInstance, setRecognitionInstance] = useState(null);
  const [isRecognitionActive, setIsRecognitionActive] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);

  // Fetch Patient Details
  const { data: patient, isSuccess, isLoading, isError } = useQuery({
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

  // Initialize Speech Recognition
  useEffect(() => {
    let rec = null;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript + ' ';
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        if (final) {
          setLiveCaptions((prev) => prev + final);
          setInterimCaption('');
        } else {
          setInterimCaption(interim);
        }
      };

      rec.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecognitionActive(false);
      };

      rec.onstart = () => setIsRecognitionActive(true);
      rec.onend = () => setIsRecognitionActive(false);

      setRecognitionInstance(rec);
    } else {
      setIsSpeechSupported(false);
    }

    return () => {
      if (rec) {
        try {
          rec.stop();
          if (rec.abort) rec.abort();
        } catch (e) {}
        rec.onresult = null;
        rec.onerror = null;
        rec.onstart = null;
        rec.onend = null;
      }
      setRecognitionInstance(null);
    };
  }, []);

  // Sync Speech Recognition with Recorder Status
  useEffect(() => {
    if (!recognitionInstance) return;

    if (status === 'recording' && !isRecognitionActive) {
      setLiveCaptions('');
      setInterimCaption('');
      try {
        recognitionInstance.start();
      } catch (err) {
        console.error('Speech recognition start error:', err);
      }
    } else if ((status === 'stopped' || status === 'idle') && isRecognitionActive) {
      try {
        recognitionInstance.stop();
      } catch (err) {
        // Recognition might already be stopped
      }
    }
  }, [status, recognitionInstance, isRecognitionActive]);

  const handleProcessAudio = async () => {
    if (!mediaBlobUrl) return;
    setIsProcessing(true);
    setSoapNotes(null);

    try {
      const audioBlob = await fetch(mediaBlobUrl).then((r) => r.blob());
      const formData = new FormData();
      formData.append('audio', audioBlob, 'visit_audio.webm');
      formData.append('patientId', patientId);

      const { data } = await api.post('/scribe/upload-audio', formData);

      setSoapNotes(data.data);
      toast.success('Audio processed successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process audio. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      if (appointmentId) {
        await api.put(`/appointments/${appointmentId}`, { status: 'COMPLETED' });
      }
      toast.success('Visit notes finalized!');
      navigate('/provider/dashboard');
    } catch (error) {
      console.error('Failed to update appointment:', error);
      toast.error('Visit notes finalized, but appointment status update failed.');
      navigate('/provider/dashboard');
    }
  };

  if (!patientId) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Patient ID Required</h2>
        <p className="text-gray-600 mt-2">Please select a patient from the directory first.</p>
        <Button onClick={() => navigate('/provider/patients')} className="mt-4">
          Go to Directory
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Panel */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="h-6 w-6 text-blue-600" /> AI Medical Scribe
          </h1>
          <p className="text-gray-600 text-sm">
            Patient: {isLoading ? 'Loading...' : isError ? 'Error loading patient' : patient?.name || 'Unknown'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {status === 'recording' ? (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1.5 rounded-full animate-pulse border border-red-100">
              <div className="w-2.5 h-2.5 bg-red-600 rounded-full" />
              <span className="font-bold text-xs uppercase tracking-wider">Listening Live</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
              <span className="font-semibold text-xs uppercase tracking-wider">Status: {status}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recording Panel */}
        <Card className="flex flex-col items-center justify-center py-8 text-center space-y-6 h-full min-h-[350px]">
          {isProcessing ? (
            <div className="flex flex-col items-center py-10">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
              <h3 className="text-xl font-bold text-gray-900">AI Scribe Processing...</h3>
              <p className="text-gray-500 mt-2 max-w-sm text-sm">
                CareSync is transcribing your multilingual consult, translating key terms, and structuring final SOAP notes in English.
              </p>
            </div>
          ) : !mediaBlobUrl ? (
            <>
              {status === 'recording' ? (
                // Live Captioning Console
                <div className="w-full space-y-5 px-6">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    {/* Sound Waves Animation */}
                    <div className="flex items-center justify-center gap-1.5 h-10">
                      <span className="w-1 h-6 bg-red-500 rounded-full animate-bounce [animation-delay:0.1s]" />
                      <span className="w-1 h-10 bg-red-600 rounded-full animate-bounce [animation-delay:0.3s]" />
                      <span className="w-1 h-5 bg-red-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1 h-12 bg-red-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                      <span className="w-1 h-6 bg-red-600 rounded-full animate-bounce [animation-delay:0.1s]" />
                    </div>
                    <span className="text-[10px] uppercase font-extrabold tracking-widest text-red-600 animate-pulse">
                      Live Transcription Feed
                    </span>
                  </div>

                  {/* Captions Screen */}
                  <div className="w-full bg-gray-950 text-left p-4 rounded-xl border border-gray-900 shadow-inner h-44 overflow-y-auto font-mono text-sm leading-relaxed text-gray-100 select-none flex flex-col justify-between">
                    <div className="flex-1 scroll-smooth">
                      {liveCaptions || interimCaption ? (
                        <p className="text-emerald-400">
                          {liveCaptions}
                          <span className="text-emerald-200 font-semibold animate-pulse">{interimCaption}</span>
                        </p>
                      ) : (
                        <p className="text-gray-600 italic">
                          Start speaking... words will appear here in real-time as you talk...
                        </p>
                      )}
                    </div>
                  </div>

                  <Button onClick={stopRecording} className="bg-gray-800 hover:bg-gray-900 w-full max-w-xs shadow-md">
                    <Square className="h-4 w-4 mr-2" /> Stop & Compile Notes
                  </Button>
                </div>
              ) : (
                // Pre-recording Screen
                <>
                  <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center transition-all hover:scale-105 duration-300 shadow-sm">
                    <Mic className="h-9 w-9 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Record Consultation</h3>
                    <p className="text-gray-500 max-w-sm mx-auto text-sm">
                      Start recording the doctor-patient dialogue. Web Speech will render live captions, and Gemini will compile SOAP notes.
                    </p>
                  </div>
                  
                  {!isSpeechSupported && (
                    <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-lg max-w-xs">
                      Live visual captions are not fully supported in this browser. However, Gemini will still transcribe your recorded audio file perfectly!
                    </div>
                  )}

                  <Button
                    onClick={startRecording}
                    className="bg-red-600 hover:bg-red-700 w-48 shadow-md shadow-red-100"
                    disabled={!isSuccess}
                  >
                    Start Recording
                  </Button>
                </>
              )}
            </>
          ) : (
            // Audio Process screen
            <>
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="h-9 w-9 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Recording Completed</h3>
                <audio src={mediaBlobUrl} controls className="mt-4 mb-2 w-full max-w-xs mx-auto" />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={clearBlobUrl}>
                  Retake
                </Button>
                <Button onClick={handleProcessAudio} className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                  Generate Final SOAP Notes
                </Button>
              </div>
            </>
          )}
        </Card>

        {/* Results Panel */}
        <Card className={`h-full flex flex-col ${!soapNotes ? 'items-center justify-center bg-gray-50/50 min-h-[350px]' : ''}`}>
          {!soapNotes ? (
            <div className="text-center text-gray-400 py-10">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">SOAP Notes Console</p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">
                Once recording is stopped and processed, generated Subjective, Objective, Assessment, and Plan structures will be populated here.
              </p>
            </div>
          ) : (
            <div className="space-y-4 flex-1 overflow-y-auto pr-2">
              <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                <h3 className="text-lg font-bold text-gray-900">Generated SOAP Note</h3>
                <Button size="sm" onClick={handleSaveNotes}>
                  <Save className="h-4 w-4 mr-2" /> Finalize Record
                </Button>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-blue-900 bg-blue-50 px-2.5 py-1 rounded w-fit mb-1.5">
                    Subjective
                  </h4>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{soapNotes.subjective}</p>
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded w-fit mb-1.5">
                    Objective
                  </h4>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{soapNotes.objective}</p>
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-amber-900 bg-amber-50 px-2.5 py-1 rounded w-fit mb-1.5">
                    Assessment
                  </h4>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{soapNotes.assessment}</p>
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-purple-900 bg-purple-50 px-2.5 py-1 rounded w-fit mb-1.5">
                    Plan
                  </h4>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{soapNotes.plan}</p>
                </div>

                {soapNotes.medicalTerms?.length > 0 && (
                  <div className="pt-4 mt-4 border-t border-gray-200">
                    <h4 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-600 animate-pulse" /> Extracted Health Terms Dictionary
                    </h4>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {soapNotes.medicalTerms.map((term, i) => (
                        <div key={i} className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                          <span className="font-bold text-xs text-blue-900 block">{term.term}</span>
                          <span className="text-gray-600 text-[11px] mt-0.5 block leading-relaxed">{term.meaning}</span>
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
