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
    } catch (error) {
      console.error("Erro ao buscar dados do tenant:", error);
    }
  };

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }
    
    // Simplificamos a lógica para usar apenas o onAuthStateChange.
    // Ele é acionado uma vez no carregamento inicial e depois em cada evento de autenticação.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);

      // Se existir uma sessão, buscamos os dados do utilizador.
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
            setTenant(null); // Garante que os dados do tenant são limpos se não houver ligação
          }
        } catch (error) {
          console.error("Erro ao buscar dados do perfil/tenant:", error);
          setProfile(null);
          setTenant(null);
        }
      } else {
        // Se não houver sessão, limpa os dados do perfil e do tenant.
        setProfile(null);
        setTenant(null);
      }
      
      // Ponto crucial: define o loading como false DEPOIS da verificação inicial estar completa.
      setLoading(false);
    });

    // Limpa a subscrição quando o componente é desmontado
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
