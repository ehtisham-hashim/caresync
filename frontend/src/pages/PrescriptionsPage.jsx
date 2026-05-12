import { useQuery } from '@tanstack/react-query';
import { Pill, AlertCircle } from 'lucide-react';
import Card from '../components/common/Card';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import { formatDate } from '../utils/formatDate';

export default function PrescriptionsPage() {
  const user = useAuthStore((state) => state.user);

  const { data: prescriptionsData, isLoading } = useQuery({
    queryKey: ['prescriptions', user?.id],
    queryFn: async () => {
      const { data } = await api.get(`/prescriptions/${user?.id}`);
      return data.data;
    },
    enabled: !!user?.id,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Prescriptions</h1>
        <p className="text-gray-600 mt-1">Manage your active medications</p>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-8">Loading prescriptions...</div>
        ) : prescriptionsData?.prescriptions?.length > 0 ? (
          prescriptionsData.prescriptions.map((rx) => (
            <Card key={rx.id} className="border-blue-100 bg-blue-50/30">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                    <Pill className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{rx.medicineName}</h3>
                    <p className="text-gray-600 mt-1">Dosage: {rx.dosage}</p>
                    <p className="text-gray-600">Frequency: {rx.frequency}</p>
                    <p className="text-gray-500 text-sm mt-2">
                      Prescribed on: {formatDate(rx.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-blue-100 flex-1 md:max-w-md shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    Doctor's Instructions
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {rx.instructions || "Take as directed by your physician."}
                  </p>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="py-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-200 border-dashed">
            <Pill className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-900">No active prescriptions</p>
            <p className="mt-1">You don't have any prescriptions on file right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}
