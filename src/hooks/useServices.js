// ==================================================================
// Ficheiro: src/hooks/useServices.js
// Responsabilidade: Gerir todo o estado relacionado com os serviços,
// atuando como a "fonte única da verdade" para os componentes de UI.
// ==================================================================
import { useState, useEffect, useCallback } from 'react';
import { useData } from '../contexts/DataContext';
import * as servicesApi from '../services/api';

export const useServices = () => {
  const { tenant } = useData();
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função para buscar os serviços, encapsulada com useCallback
  // para garantir que não seja recriada em cada renderização.
  const fetchServices = useCallback(async () => {
    if (!tenant?.id) {
      setIsLoading(false);
      setServices([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await servicesApi.getServices(tenant.id);
      setServices(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [tenant?.id]);

  // useEffect que executa a busca de serviços quando o componente
  // que usa o hook é montado ou quando o ID do tenant muda.
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Função para adicionar um serviço.
  // Ela chama a API e depois atualiza a lista local.
  const addService = async (serviceData) => {
    setError(null);
    try {
      await servicesApi.addService({ ...serviceData, tenant_id: tenant.id });
      await fetchServices(); // Recarrega a lista para refletir a adição
    } catch (err) {
      setError(err.message);
      throw err; // Re-lança o erro para o componente poder tratar (ex: fechar modal)
    }
  };

  // Função para atualizar um serviço.
  const updateService = async (serviceId, updates) => {
    setError(null);
    try {
      await servicesApi.updateService(serviceId, updates);
      await fetchServices(); // Recarrega a lista
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Função para remover um serviço.
  const deleteService = async (serviceId) => {
    setError(null);
    try {
      await servicesApi.deleteService(serviceId);
      // Otimização: em vez de recarregar, removemos o item localmente.
      setServices(currentServices => currentServices.filter(s => s.id !== serviceId));
    } catch (err) {
      setError(err.message);
    }
  };

  // O hook retorna o estado e as funções para os componentes usarem.
  return {
    services,
    isLoading,
    error,
    addService,
    updateService,
    deleteService,
    refreshServices: fetchServices, // Expõe a função de recarga
  };
};
