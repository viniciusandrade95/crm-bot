import React, { useState, useEffect, useCallback } from 'react';
import { useData, useAsyncOperation } from '../contexts/DataContext';
import { safeSupabase } from '../supabaseClient';
import { Loader } from './ui/Feedback';
import { MessageSquare, Users, Tag, RefreshCw, AlertCircle } from 'lucide-react';

export default function DashboardOverview() {
  const { tenant, loading: contextLoading } = useData();
  const [stats, setStats] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const { loading: loadingStats, error: statsError, execute, clearError } = useAsyncOperation();

  // Fetch dashboard metrics
  const fetchStats = useCallback(async () => {
    if (!tenant?.id) {
      setStats(null);
      return;
    }

    try {
      await execute(async () => {
        const { data, error } = await safeSupabase.rpc('get_dashboard_metrics', {
          p_tenant_id: tenant.id
        });

        if (error) throw error;
        
        if (data && data.length > 0) {
          setStats(data[0]);
        } else {
          setStats({
            total_messages: 0,
            unique_customers: 0,
            total_services: 0
          });
        }
        
        setLastUpdated(new Date());
      });
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err);
      setStats(null);
    }
  }, [tenant?.id, execute]);

  // Initial load
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    clearError();
    await fetchStats();
  }, [fetchStats, clearError]);

  // Loading state
  if (contextLoading || (loadingStats && !stats)) {
    return <Loader text="A carregar métricas..." />;
  }

  // No tenant state
  if (!tenant) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow-sm">
        <p className="text-gray-600">
          Configure o seu negócio para ver as métricas do dashboard.
        </p>
      </div>
    );
  }

  // Error state
  if (statsError && !stats) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">Métricas de desempenho do seu assistente.</p>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <h3 className="text-lg font-semibold text-red-800">
              Erro ao carregar métricas
            </h3>
          </div>
          <p className="text-red-700 mb-4">
            {statsError.message}
          </p>
          <button
            onClick={handleRefresh}
            disabled={loadingStats}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loadingStats ? 'animate-spin' : ''}`} />
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">
            Métricas de desempenho do seu assistente.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {lastUpdated && (
            <p className="text-sm text-gray-500">
              Última atualização: {lastUpdated.toLocaleTimeString('pt-PT')}
            </p>
          )}
          <button
            onClick={handleRefresh}
            disabled={loadingStats}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            title="Atualizar métricas"
          >
            <RefreshCw className={`w-5 h-5 ${loadingStats ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error notification */}
      {statsError && stats && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
          <span className="text-yellow-800">
            Erro ao atualizar métricas: {statsError.message}
          </span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Total de Mensagens</h3>
            <MessageSquare className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {stats?.total_messages || 0}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Mensagens processadas
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Clientes Únicos</h3>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {stats?.unique_customers || 0}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Contactos ativos
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Serviços Configurados</h3>
            <Tag className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {stats?.total_services || 0}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Serviços disponíveis
          </p>
        </div>
      </div>

      {/* Activity Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Atividade Recente
        </h3>
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
            <MessageSquare className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-2">
            Histórico de atividade em desenvolvimento
          </p>
          <p className="text-sm text-gray-400">
            Esta funcionalidade será implementada em breve
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Ações Rápidas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition">
            <div className="flex items-center mb-2">
              <Users className="w-5 h-5 text-sky-600 mr-2" />
              <span className="font-medium text-gray-900">Ver Conversas</span>
            </div>
            <p className="text-sm text-gray-500">
              Consulte as mensagens recentes
            </p>
          </button>
          
          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition">
            <div className="flex items-center mb-2">
              <Tag className="w-5 h-5 text-sky-600 mr-2" />
              <span className="font-medium text-gray-900">Gerir Serviços</span>
            </div>
            <p className="text-sm text-gray-500">
              Adicione ou edite serviços
            </p>
          </button>
          
          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition">
            <div className="flex items-center mb-2">
              <RefreshCw className="w-5 h-5 text-sky-600 mr-2" />
              <span className="font-medium text-gray-900">Configurações</span>
            </div>
            <p className="text-sm text-gray-500">
              Ajuste as configurações do negócio
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}