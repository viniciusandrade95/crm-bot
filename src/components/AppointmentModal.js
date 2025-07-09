// ==================================================================
// Ficheiro: src/components/AppointmentModal.js
// Responsabilidade: Formulário para criar e editar agendamentos.
// ==================================================================
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useCustomers } from '../hooks/useCustomers';
import { useServices } from '../hooks/useServices';
import { useAppointments } from '../hooks/useAppointments';

export function AppointmentModal({ onClose, selectedDate, appointment }) {
  const [formData, setFormData] = useState({
    customer_id: '',
    service_id: '',
    appointment_date: selectedDate ? selectedDate.toISOString().slice(0, 10) : '',
    appointment_time: '09:00',
    notes: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const { customers } = useCustomers();
  const { services } = useServices();
  const { addAppointment, updateAppointment } = useAppointments();

  useEffect(() => {
    if (appointment) {
      const date = new Date(appointment.appointment_date);
      setFormData({
        customer_id: appointment.customer_id,
        service_id: appointment.service_id,
        appointment_date: date.toISOString().slice(0, 10),
        appointment_time: date.toTimeString().slice(0, 5),
        notes: appointment.notes || ''
      });
    }
  }, [appointment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    const [hours, minutes] = formData.appointment_time.split(':');
    const appointmentDateTime = new Date(formData.appointment_date);
    appointmentDateTime.setHours(hours, minutes);

    const dataToSave = {
      customer_id: formData.customer_id,
      service_id: formData.service_id,
      appointment_date: appointmentDateTime.toISOString(),
      notes: formData.notes
    };

    try {
      if (appointment) {
        await updateAppointment(appointment.id, dataToSave);
      } else {
        await addAppointment(dataToSave);
      }
      onClose();
    } catch (error) {
      console.error("Erro ao guardar agendamento:", error);
      // Aqui pode mostrar uma notificação de erro
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-6">{appointment ? 'Editar Agendamento' : 'Novo Agendamento'}</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
            <select name="customer_id" value={formData.customer_id} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="" disabled>Selecione um cliente</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name} - {c.phone_number}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Serviço</label>
            <select name="service_id" value={formData.service_id} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="" disabled>Selecione um serviço</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.service_name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
              <input type="date" name="appointment_date" value={formData.appointment_date} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hora</label>
              <input type="time" name="appointment_time" value={formData.appointment_time} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg"></textarea>
          </div>
          <div className="pt-6 flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancelar</button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 flex items-center">
              {isSaving && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
              {isSaving ? 'A guardar...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
