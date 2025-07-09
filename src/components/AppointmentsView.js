// ==================================================================
// Ficheiro: src/components/AppointmentsView.js
// Responsabilidade: Exibir o calendário e gerir os agendamentos.
// ==================================================================
import React, { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppointments } from '../hooks/useAppointments';
import { AppointmentModal } from './AppointmentModal';
import { Loader } from './ui/Feedback';

const CalendarHeader = ({ currentDate, onPrevMonth, onNextMonth }) => (
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl font-bold text-gray-800">
      {currentDate.toLocaleString('pt-PT', { month: 'long', year: 'numeric' })}
    </h2>
    <div className="flex items-center space-x-2">
      <button onClick={onPrevMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft className="w-5 h-5" /></button>
      <button onClick={onNextMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronRight className="w-5 h-5" /></button>
    </div>
  </div>
);

const CalendarGrid = ({ days, onDayClick, appointments }) => {
  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  return (
    <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200">
      {weekdays.map(day => (
        <div key={day} className="text-center font-semibold text-sm py-2 bg-gray-50">{day}</div>
      ))}
      {days.map((day, index) => (
        <div key={index} onClick={() => day && onDayClick(day)} className={`p-2 h-32 bg-white relative ${day ? 'cursor-pointer hover:bg-sky-50' : 'bg-gray-50'}`}>
          {day && <span className="text-sm">{day.getDate()}</span>}
          <div className="mt-1 space-y-1 overflow-y-auto">
            {appointments
              .filter(a => new Date(a.appointment_date).getDate() === day?.getDate())
              .map(a => (
                <div key={a.id} className="bg-sky-100 text-sky-800 text-xs p-1 rounded">
                  {a.services.service_name}
                </div>
              ))
            }
          </div>
        </div>
      ))}
    </div>
  );
};

export function AppointmentsView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  
  const { appointments, isLoading, fetchAppointments } = useAppointments();

  useEffect(() => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    fetchAppointments(startOfMonth.toISOString(), endOfMonth.toISOString());
  }, [currentDate, fetchAppointments]);

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    
    return days;
  };
  
  const handleDayClick = (date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
    // Recarrega os agendamentos após fechar o modal
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    fetchAppointments(startOfMonth.toISOString(), endOfMonth.toISOString());
  };

  if (isLoading) return <Loader text="A carregar agendamentos..." />;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Agenda</h2>
        <button onClick={() => handleDayClick(new Date())} className="bg-sky-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-sky-700 transition flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Novo Agendamento
        </button>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <CalendarHeader 
          currentDate={currentDate}
          onPrevMonth={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
          onNextMonth={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
        />
        <CalendarGrid days={getDaysInMonth()} onDayClick={handleDayClick} appointments={appointments} />
      </div>
      {isModalOpen && <AppointmentModal onClose={handleModalClose} selectedDate={selectedDate} />}
    </div>
  );
}
