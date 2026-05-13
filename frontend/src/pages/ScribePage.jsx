import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { scribeService } from '../services/scribeService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Mic, Square, Upload, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ScribePage() {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [patientId, setPatientId] = useState(searchParams.get('patientId') || '');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [result, setResult] = useState(null);

  const uploadMutation = useMutation({
    mutationFn: scribeService.uploadAudio,
    onSuccess: (data) => {
      setResult(data.data);
      toast.success('Visit processed successfully!');
      queryClient.invalidateQueries(['doctor-visits']);
      setAudioBlob(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to process audio');
    },
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);

      // Timer
      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      recorder.onstop = () => {
        clearInterval(interval);
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };
    } catch (error) {
      toast.error('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleUpload = () => {
    if (!patientId) {
      toast.error('Please enter patient ID');
      return;
    }
    if (!audioBlob) {
      toast.error('No audio recorded');
      return;
    }

    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('patientId', patientId);

    uploadMutation.mutate(formData);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Medical Scribe</h1>
        <p className="mt-1 text-sm text-gray-500">
          Record patient consultation and generate SOAP notes automatically
        </p>
      </div>

      {/* Recording Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Recording Controls */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recording</h2>
          
          <div className="space-y-4">
            <Input
              label="Patient ID"
              placeholder="Enter patient ID"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              disabled={isRecording || uploadMutation.isPending}
            />

            {/* Recording Status */}
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              {isRecording ? (
                <>
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full bg-red-100 flex items-center justify-center animate-pulse">
                      <Mic className="h-12 w-12 text-red-600" />
                    </div>
                    <div className="absolute inset-0 rounded-full border-4 border-red-600 animate-ping opacity-75"></div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{formatTime(recordingTime)}</p>
                  <p className="text-sm text-gray-500">Recording in progress...</p>
                </>
              ) : audioBlob ? (
                <>
                  <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">
                    <Square className="h-12 w-12 text-green-600" />
                  </div>
                  <p className="text-lg font-medium text-gray-900">Recording Complete</p>
                  <p className="text-sm text-gray-500">Duration: {formatTime(recordingTime)}</p>
                </>
              ) : (
                <>
                  <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center">
                    <Mic className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">Ready to record</p>
                </>
              )}
            </div>

            {/* Controls */}
            <div className="flex gap-3">
              {!isRecording && !audioBlob && (
                <Button
                  onClick={startRecording}
                  className="flex-1"
                  disabled={uploadMutation.isPending}
                >
                  <Mic className="h-4 w-4 mr-2" />
                  Start Recording
                </Button>
              )}
              
              {isRecording && (
                <Button
                  onClick={stopRecording}
                  variant="danger"
                  className="flex-1"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop Recording
                </Button>
              )}

              {audioBlob && !isRecording && (
                <>
                  <Button
                    onClick={() => {
                      setAudioBlob(null);
                      setRecordingTime(0);
                      setResult(null);
                    }}
                    variant="outline"
                    className="flex-1"
                    disabled={uploadMutation.isPending}
                  >
                    Record Again
                  </Button>
                  <Button
                    onClick={handleUpload}
                    className="flex-1"
                    isLoading={uploadMutation.isPending}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Process & Generate SOAP
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Right: Instructions */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructions</h2>
          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex items-start space-x-3">
              <div className="shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs">
                1
              </div>
              <p>Enter the patient ID in the field above</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs">
                2
              </div>
              <p>Click "Start Recording" and conduct your patient consultation naturally</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs">
                3
              </div>
              <p>Click "Stop Recording" when the consultation is complete</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs">
                4
              </div>
              <p>Click "Process & Generate SOAP" to get AI-generated clinical notes</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-2">💡 Tips for Best Results</p>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Speak clearly and at a moderate pace</li>
              <li>Minimize background noise</li>
              <li>Include patient symptoms, examination findings, and treatment plan</li>
              <li>Review and edit the generated notes before finalizing</li>
            </ul>
          </div>
        </Card>
      </div>

      {/* Results */}
      {uploadMutation.isPending && (
        <Card>
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <p className="text-lg font-medium text-gray-900">Processing Audio...</p>
            <p className="text-sm text-gray-500 mt-2">
              Transcribing and generating SOAP notes with AI
            </p>
          </div>
        </Card>
      )}

      {result && (
        <div className="space-y-6">
          {/* Raw Transcript */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Raw Transcript</h2>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {result.visit?.rawTranscript || 'No transcript available'}
              </p>
            </div>
          </Card>

          {/* SOAP Notes */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">SOAP Notes</h2>
            <div className="space-y-4">
              {/* Subjective */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Subjective</h3>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {result.visit?.subjective || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Objective */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Objective</h3>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {result.visit?.objective || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Assessment */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Assessment</h3>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {result.visit?.assessment || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Plan */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Plan</h3>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {result.visit?.plan || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Medical Terms */}
          {result.visit?.medicalTerms && result.visit.medicalTerms.length > 0 && (
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Medical Terms Explained</h2>
              <div className="space-y-2">
                {result.visit.medicalTerms.map((term, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">{term.term}</p>
                    <p className="text-sm text-gray-600 mt-1">{term.meaning}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
