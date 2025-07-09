// ==================================================================
// Ficheiro: src/hooks/useAppointments.js
// Responsabilidade: Gerir o estado dos agendamentos.
// ==================================================================
import { useState, useCallback } from 'react';
import { useData } from '../contexts/DataContext';
import * as api from '../services/api';

export const useAppointments = () => {
  const { tenant } = useData();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAppointments = useCallback(async (startDate, endDate) => {
    if (!tenant?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getAppointments(tenant.id, startDate, endDate);
      setAppointments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [tenant?.id]);

  const addAppointment = async (appointmentData) => {
    try {
      await api.addAppointment({ ...appointmentData, tenant_id: tenant.id });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateAppointment = async (appointmentId, updates) => {
    try {
      await api.updateAppointment(appointmentId, updates);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteAppointment = async (appointmentId) => {
    try {
      await api.deleteAppointment(appointmentId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return { 
    appointments, 
    isLoading, 
    error, 
    fetchAppointments, 
    addAppointment, 
    updateAppointment, 
    deleteAppointment 
  };
};
