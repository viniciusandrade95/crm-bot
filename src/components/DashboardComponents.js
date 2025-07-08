import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { supabase } from '../supabaseClient';
import { Loader } from './ui/Feedback';
import { MessageSquare, Users, Tag } from 'lucide-react';

export default function DashboardOverview() {
  const { tenant, loading: contextLoading } = useData();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (tenant?.id) {
        setLoadingStats(true);
        const { data, error } = await supabase.rpc('get_dashboard_metrics', {
          p_tenant_id: tenant.id
        });

        if (error) {
          console.error("Erro ao buscar métricas do dashboard:", error);
          setStats(null);
        } else if (data && data.length > 0) {
          setStats(data[0]);
        }
        setLoadingStats(false);
      } else if (!contextLoading) {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [tenant, contextLoading]);

  if (contextLoading || loadingStats) {
    return <Loader text="A carregar métricas..." />;
  }

  if (!stats) {
    return <div className="text-center p-8 bg-white rounded-lg shadow-sm">Não foi possível carregar as métricas. Certifique-se de que o seu negócio está configurado.</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-1">Métricas de desempenho do seu assistente.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Total de Mensagens</h3>
            <MessageSquare className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total_messages || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Clientes Únicos</h3>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.unique_customers || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Serviços Configurados</h3>
            <Tag className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total_services || 0}</p>
        </div>
      </div>
       <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente</h3>
        <p className="text-gray-500">O histórico de atividade será implementado aqui.</p>
      </div>
    </div>
  );
}
