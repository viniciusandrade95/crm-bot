// ==================================================================
// Ficheiro: src/components/DashboardOverview.js - Versão Completa
// ==================================================================
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useData } from '../contexts/DataContext';
import { supabase } from '../supabaseClient';
import { Loader } from './ui/Feedback';
import { 
  MessageSquare, 
  Users, 
  Tag, 
  TrendingUp, 
  Clock, 
  Activity,
  Zap,
  ChevronRight,
  Settings,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  BarChart3
} from 'lucide-react';

// Componente de Mini Calendário
const MiniCalendar = ({ appointments = [] }) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  
  const days = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  
  // Criar array de dias
  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }
  
  const hasAppointment = (day) => {
    // Simular marcações para demonstração
    return [5, 12, 15, 20, 25].includes(day);
  };
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {monthNames[currentMonth]} {currentYear}
        </h3>
        <button className="text-sky-600 hover:text-sky-700 text-sm font-medium flex items-center">
          Ver calendário completo
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <div key={index} className="text-center text-xs font-medium text-gray-500 pb-2">
            {day}
          </div>
        ))}
        
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`
              aspect-square flex items-center justify-center text-sm relative
              ${!day ? '' : 'hover:bg-gray-50 cursor-pointer rounded-lg'}
              ${day === today.getDate() ? 'bg-sky-100 text-sky-700 font-bold' : ''}
            `}
          >
            {day}
            {day && hasAppointment(day) && (
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-sky-600 rounded-full"></div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Marcações hoje</span>
          <span className="font-semibold text-gray-900">3</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-gray-600">Próxima marcação</span>
          <span className="font-semibold text-sky-600">14:30</span>
        </div>
      </div>
    </div>
  );
};

// Componente de Getting Started
const GettingStarted = ({ tenant, onNavigate }) => {
  const steps = [
    {
      title: 'Configurar informações do negócio',
      description: 'Nome, horários e contactos',
      completed: tenant?.business_name && tenant?.working_hours,
      action: 'Configurar',
      link: 'settings'
    },
    {
      title: 'Adicionar serviços',
      description: 'Lista de serviços e preços',
      completed: tenant?.services?.length > 0,
      action: 'Adicionar serviços',
      link: 'services'
    },
    {
      title: 'Personalizar o assistente',
      description: 'Tom de voz e respostas',
      completed: true, // TODO: Adicionar campo na BD
      action: 'Personalizar',
      link: 'settings'
    },
    {
      title: 'Conectar WhatsApp',
      description: 'Ligar o número ao sistema',
      completed: tenant?.business_phone,
      action: 'Conectar',
      link: 'settings'
    }
  ];
  
  const completedSteps = steps.filter(s => s.completed).length;
  const progress = (completedSteps / steps.length) * 100;
  
  return (
    <div className="bg-gradient-to-br from-sky-50 to-indigo-50 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Configuração Inicial
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Complete estes passos para começar a usar o sistema
      </p>
      
      {/* Barra de progresso */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">Progresso</span>
          <span className="font-medium text-gray-900">{completedSteps} de {steps.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-sky-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {/* Lista de passos */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div 
            key={index} 
            className={`
              flex items-center justify-between p-3 rounded-lg
              ${step.completed ? 'bg-green-50' : 'bg-white'}
            `}
          >
            <div className="flex items-start space-x-3">
              {step.completed ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-gray-300 mt-0.5" />
              )}
              <div>
                <p className="font-medium text-gray-900 text-sm">{step.title}</p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            </div>
            {!step.completed && (
              <button 
                onClick={() => onNavigate(step.link)}
                className="text-sky-600 hover:text-sky-700 text-sm font-medium"
              >
                {step.action}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente principal do Dashboard
export default function DashboardOverview({ onNavigate }) {
  const { tenant, loading: contextLoading } = useData();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [timeFilter, setTimeFilter] = useState('month');
  
  // Dados de exemplo para demonstração
  const demoStats = useMemo(() => ({
    total_messages: 0,
    unique_customers: 0,
    total_services: tenant?.services?.length || 0,
    messages_today: 0,
    messages_this_week: 0,
    messages_this_month: 0,
    response_rate: 0
  }), [tenant?.services?.length]);

  useEffect(() => {
    const fetchStats = async () => {
      if (tenant?.id) {
        setLoadingStats(true);
        const { data, error } = await supabase.rpc('get_dashboard_metrics', {
          p_tenant_id: tenant.id
        });

        if (error) {
          console.error("Erro ao buscar métricas:", error);
          // Usar dados demo se houver erro
          setStats(demoStats);
        } else if (data && data.length > 0) {
          // Se não há dados reais, usar demo
          const hasRealData = data[0].total_messages > 0;
          setStats(hasRealData ? data[0] : { ...demoStats, ...data[0] });
        }
        setLoadingStats(false);
      } else if (!contextLoading) {
        setStats(demoStats);
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [tenant, contextLoading, demoStats]);

  if (contextLoading || loadingStats) {
    return <Loader text="A carregar dashboard..." />;
  }

  const isNewUser = !stats || stats.total_messages === 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Olá{tenant?.business_name ? `, ${tenant.business_name}` : ''}! 👋
          </h2>
          <p className="text-gray-600 mt-1">
            {isNewUser 
              ? 'Vamos configurar o seu assistente virtual'
              : 'Aqui está o resumo do seu negócio'}
          </p>
        </div>
        
        {!isNewUser && (
          <div className="flex gap-2">
            <button
              onClick={() => setTimeFilter('today')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                timeFilter === 'today' 
                  ? 'bg-sky-100 text-sky-700' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Hoje
            </button>
            <button
              onClick={() => setTimeFilter('week')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                timeFilter === 'week' 
                  ? 'bg-sky-100 text-sky-700' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setTimeFilter('month')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                timeFilter === 'month' 
                  ? 'bg-sky-100 text-sky-700' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Mês
            </button>
          </div>
        )}
      </div>

      {/* Conteúdo condicional baseado se é novo utilizador */}
      {isNewUser ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
          <GettingStarted tenant={tenant} onNavigate={onNavigate} />
            
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Ações Rápidas
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={() => onNavigate('services')}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-sky-500 hover:bg-sky-50 transition group"
                >
                  <div className="flex items-center space-x-3">
                    <Tag className="w-5 h-5 text-gray-400 group-hover:text-sky-600" />
                    <span className="font-medium text-gray-700">Adicionar Serviço</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-sky-600" />
                </button>
                
                <button 
                  onClick={() => onNavigate('settings')}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-sky-500 hover:bg-sky-50 transition group"
                >
                  <div className="flex items-center space-x-3">
                    <Settings className="w-5 h-5 text-gray-400 group-hover:text-sky-600" />
                    <span className="font-medium text-gray-700">Configurar Horários</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-sky-600" />
                </button>
                
                <button 
                  onClick={() => onNavigate('customers')}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-sky-500 hover:bg-sky-50 transition group"
                >
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-gray-400 group-hover:text-sky-600" />
                    <span className="font-medium text-gray-700">Importar Clientes</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-sky-600" />
                </button>
                
                <button 
                  onClick={() => onNavigate('messages')}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-sky-500 hover:bg-sky-50 transition group"
                >
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="w-5 h-5 text-gray-400 group-hover:text-sky-600" />
                    <span className="font-medium text-gray-700">Testar Assistente</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-sky-600" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <MiniCalendar />
            
            {/* Dicas */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-900 mb-1">Dica do Dia</h4>
                  <p className="text-sm text-amber-700">
                    Configure horários específicos para cada dia da semana para melhor gestão de marcações.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Métricas para utilizadores com dados */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-sky-100 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-sky-600" />
                </div>
                <span className="text-sm font-medium text-green-600">+12%</span>
              </div>
              <h3 className="text-sm font-medium text-gray-500">Mensagens</h3>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {timeFilter === 'today' ? stats.messages_today :
                 timeFilter === 'week' ? stats.messages_this_week :
                 stats.messages_this_month}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <Activity className="w-4 h-4 text-gray-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-500">Clientes Ativos</h3>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.unique_customers}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <h3 className="text-sm font-medium text-gray-500">Taxa de Resposta</h3>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {Math.round(stats.response_rate)}%
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <Tag className="w-6 h-6 text-amber-600" />
                </div>
                <Clock className="w-4 h-4 text-gray-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-500">Serviços</h3>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total_services}</p>
            </div>
          </div>

          {/* Gráficos e calendário */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Atividade Semanal
              </h3>
              {/* Aqui pode adicionar um gráfico real com Chart.js ou Recharts */}
              <div className="h-64 flex items-center justify-center text-gray-400">
                <p>Gráfico de atividade virá aqui</p>
              </div>
            </div>
            
            <MiniCalendar />
          </div>
        </>
      )}
    </div>
  );
}
