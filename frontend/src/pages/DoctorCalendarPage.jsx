import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { doctorService } from '../services/doctorService';
import { appointmentService } from '../services/appointmentService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import { Calendar, Clock, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate } from '../utils/formatDate';

export default function DoctorCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Get start and end of week
  const getWeekRange = (date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay()); // Start of week (Sunday)
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    
    return { start, end };
  };

  const { start, end } = getWeekRange(currentDate);

  const { data: scheduleData, isLoading } = useQuery({
    queryKey: ['doctor-schedule', start.toISOString(), end.toISOString()],
    queryFn: () => doctorService.getSchedule(start.toISOString(), end.toISOString()),
  });

  const appointments = scheduleData?.data?.appointments || [];

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Group appointments by date
  const appointmentsByDate = appointments.reduce((acc, apt) => {
    const date = new Date(apt.scheduledAt).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(apt);
    return acc;
  }, {});

  // Generate week days
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(day.getDate() + i);
    weekDays.push(day);
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return <Loader size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage your appointment schedule
          </p>
        </div>
        <Button onClick={goToToday}>
          <Calendar className="h-4 w-4 mr-2" />
          Today
        </Button>
      </div>

      {/* Week Navigation */}
      <Card>
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold text-gray-900">
            {formatDate(start, 'date')} - {formatDate(end, 'date')}
          </h2>
          <Button variant="outline" size="sm" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Week View */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((day) => {
          const dateStr = day.toDateString();
          const dayAppointments = appointmentsByDate[dateStr] || [];
          const isToday = day.toDateString() === new Date().toDateString();

          return (
            <Card
              key={dateStr}
              className={`${isToday ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div className="text-center mb-3">
                <p className="text-xs font-medium text-gray-500 uppercase">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <p className={`text-2xl font-bold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                  {day.getDate()}
                </p>
              </div>

              <div className="space-y-2">
                {dayAppointments.length > 0 ? (
                  dayAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <Clock className="h-3 w-3 text-gray-500" />
                        <p className="text-xs font-medium text-gray-900">
                          {formatDate(apt.scheduledAt, 'time')}
                        </p>
                      </div>
                      <p className="text-xs text-gray-700 font-medium truncate">
                        {apt.patient?.name}
                      </p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 text-center py-4">
                    No appointments
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Appointments List */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          All Appointments This Week ({appointments.length})
        </h2>
        {appointments.length > 0 ? (
          <div className="space-y-3">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="shrink-0">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {apt.patient?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {apt.reason || 'General Consultation'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(apt.scheduledAt, 'time')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(apt.scheduledAt, 'date')}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(apt.status)}`}>
                    {apt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>No appointments scheduled for this week</p>
          </div>
        )}
      </Card>
    </div>
  );
}
