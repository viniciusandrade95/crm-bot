// ==================================================================
// Ficheiro: src/hooks/useCustomers.js (Final)
// Responsabilidade: Gerir todo o estado dos clientes de forma robusta.
// ==================================================================
import { useState, useEffect, useCallback } from 'react';
import { useData } from '../contexts/DataContext';
import * as api from '../services/api';

export const useCustomers = () => {
  const { tenant } = useData();
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCustomers = useCallback(async () => {
    if (!tenant?.id) {
      setCustomers([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getCustomers(tenant.id);
      setCustomers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [tenant?.id]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const addCustomer = useCallback(async (customerData) => {
    if (!tenant?.id) {
      throw new Error("Não é possível adicionar um cliente: negócio não encontrado.");
    }
    setError(null);
    try {
      await api.addCustomer({ ...customerData, tenant_id: tenant.id });
      await fetchCustomers();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [tenant?.id, fetchCustomers]);

  const updateCustomer = useCallback(async (customerId, updates) => {
    setError(null);
    try {
      await api.updateCustomer(customerId, updates);
      await fetchCustomers();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchCustomers]);

  const deleteCustomer = useCallback(async (customerId) => {
    setError(null);
    try {
      await api.deleteCustomer(customerId);
      setCustomers(current => current.filter(c => c.id !== customerId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return { 
    customers, 
    isLoading, 
    error, 
    addCustomer, 
    updateCustomer, 
    deleteCustomer,
    refreshCustomers: fetchCustomers 
  };
};
