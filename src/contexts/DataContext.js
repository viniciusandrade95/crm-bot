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
      // ATUALIZAÇÃO: Agora também busca os clientes (customers)
      const { data: tenantData, error } = await supabase
        .from('tenants')
        .select('*, services(*), customers(*)') // Adicionado customers(*)
        .eq('id', tenantId)
        .order('service_name', { foreignTable: 'services' })
        .order('created_at', { foreignTable: 'customers', ascending: false }) // Ordena os clientes por mais recentes
        .single();
      
      if (error) throw error;
      setTenant(tenantData);
    } catch (error) {
      console.error("Erro ao buscar dados do tenant:", error);
    }
  };

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }
    
    // Lógica de autenticação e busca de dados inicial
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);

      if (session?.user) {
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setProfile(profileData);

          if (profileData?.tenant_id) {
            await fetchTenantData(profileData.tenant_id);
          } else {
            setTenant(null);
          }
        } catch (error) {
          console.error("Erro ao buscar dados do perfil/tenant:", error);
          setProfile(null);
          setTenant(null);
        }
      } else {
        setProfile(null);
        setTenant(null);
      }
      
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
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
