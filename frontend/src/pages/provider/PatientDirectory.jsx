import { useQuery } from '@tanstack/react-query';
import { Search, Users, Mail, Pill, Clock, Calendar, X, Check, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function PatientDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Prescription modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('1 tablet');
  const [frequency, setFrequency] = useState('Once daily');
  const [duration, setDuration] = useState('7 days');
  const [notes, setNotes] = useState('');
  const [selectedTimes, setSelectedTimes] = useState({
    morning: true,
    afternoon: false,
    evening: false,
    night: false,
  });
  const [customHour, setCustomHour] = useState('09');
  const [customMinute, setCustomMinute] = useState('00');
  const [customPeriod, setCustomPeriod] = useState('AM');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: patients, isLoading, refetch } = useQuery({
    queryKey: ['patients-directory'],
    queryFn: async () => {
      const { data } = await api.get('/users/patients');
      return data.data;
    },
  });

  const filteredPatients = patients?.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleOpenPrescriptionModal = (patient) => {
    setSelectedPatient(patient);
    setMedicineName('');
    setDosage('1 tablet');
    setFrequency('Once daily');
    setDuration('7 days');
    setNotes('');
    setSelectedTimes({
      morning: true,
      afternoon: false,
      evening: false,
      night: false,
    });
    setCustomHour('09');
    setCustomMinute('00');
    setCustomPeriod('AM');
    setIsModalOpen(true);
  };

  const handleClosePrescriptionModal = () => {
    setIsModalOpen(false);
    setSelectedPatient(null);
  };

  const handleTimeCheckboxChange = (timeKey) => {
    setSelectedTimes(prev => {
      const next = { ...prev, [timeKey]: !prev[timeKey] };
      const count = Object.values(next).filter(Boolean).length;
      if (count === 1) setFrequency('Once daily');
      else if (count === 2) setFrequency('Twice daily');
      else if (count === 3) setFrequency('Three times daily');
      else if (count === 4) setFrequency('Four times daily');
      return next;
    });
  };

  const handleSavePrescription = async (e) => {
    e.preventDefault();
    if (!medicineName.trim()) {
      toast.error('Please enter a medicine name.');
      return;
    }
    if (!dosage.trim()) {
      toast.error('Please enter the dosage.');
      return;
    }

    setIsSubmitting(true);
    try {
      const timesArray = [];
      if (selectedTimes.morning) timesArray.push('Morning');
      if (selectedTimes.afternoon) timesArray.push('Afternoon');
      if (selectedTimes.evening) timesArray.push('Evening');
      if (selectedTimes.night) timesArray.push('Night');
      
      const timeDetailStr = timesArray.length > 0 
        ? `(${timesArray.join(' & ')} - approx ${customHour}:${customMinute} ${customPeriod})` 
        : `(at ${customHour}:${customMinute} ${customPeriod})`;

      const payload = {
        patientId: selectedPatient.id,
        medicineName: medicineName.trim(),
        dosage: dosage.trim(),
        frequency: frequency,
        duration: duration.trim(),
        notes: notes.trim() ? `${notes.trim()}\nSchedule Details: ${timeDetailStr}` : `Schedule Details: ${timeDetailStr}`,
      };

      await api.post('/prescriptions', payload);
      toast.success(`Prescription successfully added for ${selectedPatient.name}!`);
      handleClosePrescriptionModal();
      refetch();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to add prescription.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Medicine suggestions list
  const medicineSuggestions = [
    'Panadol 500mg',
    'Amoxicillin 250mg',
    'Metformin 500mg',
    'Lipitor 10mg',
    'Ibuprofen 400mg',
    'Omeprazole 20mg',
    'Albuterol Inhaler'
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patient Directory</h1>
          <p className="text-gray-600 mt-1">Manage and view patient records</p>
        </div>
        <div className="w-full sm:w-72 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading patients...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Blood Group
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                          {patient?.name?.charAt(0) || '?'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{patient?.name || 'Unknown Patient'}</div>
                          <div className="text-sm text-gray-500">ID: {patient.id.substring(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail className="h-4 w-4 mr-2" />
                        {patient.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        {patient.bloodGroup || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <Link to={`/provider/scribe/${patient.id}`} className="text-blue-600 hover:text-blue-900 font-semibold mr-2">
                        Scribe Note
                      </Link>
                      <button
                        onClick={() => handleOpenPrescriptionModal(patient)}
                        className="text-indigo-600 hover:text-indigo-900 font-semibold border-l border-gray-200 pl-3 inline-flex items-center gap-1.5"
                      >
                        <Pill className="h-3.5 w-3.5" />
                        Add Prescription
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPatients.length === 0 && (
              <div className="py-12 text-center text-gray-500 flex flex-col items-center">
                <Users className="h-12 w-12 text-gray-300 mb-3" />
                <p>No patients found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Premium Prescription Creator Modal */}
      {isModalOpen && selectedPatient && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                  <Pill className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Add Structured Prescription
                  </h2>
                  <p className="text-xs text-gray-500">
                    Prescribing for: <span className="font-semibold text-indigo-700">{selectedPatient.name}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={handleClosePrescriptionModal}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSavePrescription} className="flex-1 overflow-y-auto p-6 space-y-5">
              
              {/* Medicine Name with AI suggestions */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">
                  Medicine Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter medicine name..."
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                />
                
                {/* Visual quick suggestions row */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {medicineSuggestions.map((med) => (
                    <button
                      key={med}
                      type="button"
                      onClick={() => setMedicineName(med)}
                      className="px-2 py-1 text-[11px] font-semibold text-gray-600 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-700 rounded-md border border-gray-200/60 transition-colors"
                    >
                      +{med.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dosage & Duration side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    Dosage
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1 tablet, 5ml"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium"
                  />
                  <div className="flex gap-1">
                    {['1 tablet', '2 pills', '5ml'].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDosage(d)}
                        className="px-1.5 py-0.5 text-[10px] bg-gray-50 hover:bg-gray-100 text-gray-600 rounded"
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    Duration
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 7 days, 1 week"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium"
                  />
                  <div className="flex gap-1">
                    {['3 days', '5 days', '7 days'].map((dur) => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => setDuration(dur)}
                        className="px-1.5 py-0.5 text-[10px] bg-gray-50 hover:bg-gray-100 text-gray-600 rounded"
                      >
                        {dur}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Time of Day (Frequency Checkboxes) */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">
                  Recommended Times
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.keys(selectedTimes).map((time) => (
                    <label
                      key={time}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedTimes[time]
                          ? 'border-indigo-600 bg-indigo-50/40 text-indigo-700'
                          : 'border-gray-150 bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={selectedTimes[time]}
                        onChange={() => handleTimeCheckboxChange(time)}
                      />
                      <Clock className={`h-4.5 w-4.5 mb-1 ${selectedTimes[time] ? 'text-indigo-600' : 'text-gray-400'}`} />
                      <span className="text-xs font-bold capitalize">{time}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Custom Target Time (Hour, Minute, AM/PM) */}
              <div className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">
                    Exact Reminder Time (AM / PM)
                  </label>
                  <span className="text-[10px] font-semibold text-gray-400">Controls target clock schedule</span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  {/* Hour */}
                  <select
                    value={customHour}
                    onChange={(e) => setCustomHour(e.target.value)}
                    className="flex-1 bg-white border border-gray-200 rounded-lg p-2 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  <span className="font-bold text-gray-400">:</span>
                  
                  {/* Minute */}
                  <select
                    value={customMinute}
                    onChange={(e) => setCustomMinute(e.target.value)}
                    className="flex-1 bg-white border border-gray-200 rounded-lg p-2 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {['00', '15', '30', '45'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  
                  {/* AM/PM */}
                  <select
                    value={customPeriod}
                    onChange={(e) => setCustomPeriod(e.target.value)}
                    className="flex-1 bg-white border border-gray-200 rounded-lg p-2 text-sm font-bold text-indigo-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              {/* Special Instructions / Clinical Notes */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">
                  Special Instructions / Notes
                </label>
                <textarea
                  placeholder="e.g. Take after meals, swallow with warm water..."
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClosePrescriptionModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Save Prescription
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
