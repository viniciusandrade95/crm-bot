import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase, isConfigured } from '../supabaseClient';

// Cria o Contexto
const DataContext = createContext({});

// Cria o Provedor de Dados
export const DataProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [tenant, setTenant] = useState(null);

  // Função para buscar os dados do negócio (tenant)
  const fetchTenantData = async (tenantId) => {
    if (!tenantId) {
      setTenant(null);
      return;
    }
    try {
      const { data: tenantData, error } = await supabase
        .from('tenants')
        .select('*, services(*)') // Também busca os serviços associados
        .eq('id', tenantId)
        .order('service_name', { foreignTable: 'services' })
        .single();
      
      if (error) throw error;
      setTenant(tenantData);
    } catch (error)      
            {console.error("Erro ao buscar dados do tenant:", error);
    }
  };

  useEffect(() => {
    // Apenas executa a lógica se o Supabase estiver configurado
    if (!isConfigured) {
      setLoading(false);
      return;
    }
    
    // Função para buscar todos os dados iniciais do utilizador logado
    const fetchInitialData = async (user) => {
      if (!user) {
        setProfile(null);
        setTenant(null);
        return;
      }
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(profileData);
        if (profileData?.tenant_id) {
          await fetchTenantData(profileData.tenant_id);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do perfil:", error);
      }
    };

    // Função para obter a sessão atual ao carregar a app
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        await fetchInitialData(session?.user);
      } catch (error) {
        console.error("Erro ao obter a sessão:", error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Ouve as mudanças de autenticação (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      await fetchInitialData(session?.user);
    });

    // Limpa a subscrição quando o componente é desmontado
    return () => subscription.unsubscribe();
  }, []);

  // Valor a ser partilhado com toda a aplicação
  const value = {
    session,
    profile,
    tenant,
    loading,
    signOut: () => supabase.auth.signOut(),
    refreshTenant: () => fetchTenantData(profile?.tenant_id)
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

// Hook personalizado para usar facilmente os dados
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData deve ser usado dentro de DataProvider');
  }
  return context;
};
