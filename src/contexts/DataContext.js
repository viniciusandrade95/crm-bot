import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase, isConfigured } from '../supabaseClient';

const DataContext = createContext({});

export const DataProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [tenant, setTenant] = useState(null);

  const fetchTenantData = async (tenantId) => {
    if (!tenantId) {
      setTenant(null);
      return;
    }
    try {
      const { data: tenantData, error } = await supabase
        .from('tenants')
        .select('*, services(*), customers(*)')
        .eq('id', tenantId)
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
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setLoading(true);

      if (session?.user) {
        try {
          // Tenta buscar o perfil do utilizador
          let { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          // Se o perfil NÃO existir, é o primeiro login.
          if (!profileData) {
            console.log('Perfil não encontrado, a configurar novo utilizador...');
            // Chama a nossa nova função RPC para criar o perfil e o tenant.
            const { data: newTenantId, error: rpcError } = await supabase.rpc('setup_new_user');

            if (rpcError) {
              throw new Error(`Erro ao configurar novo utilizador: ${rpcError.message}`);
            }

            // Após a criação, busca novamente o perfil que agora deve existir.
            const { data: newProfileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            profileData = newProfileData;
          }
          
          setProfile(profileData);

          if (profileData?.tenant_id) {
            await fetchTenantData(profileData.tenant_id);
          } else {
            setTenant(null);
          }

        } catch (error) {
          console.error("Erro ao buscar ou criar dados do perfil/tenant:", error);
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

  const value = {
    session,
    profile,
    tenant,
    loading,
    signOut: () => supabase.auth.signOut(),
    refreshTenant: async () => {
      if (profile?.tenant_id) {
        await fetchTenantData(profile.tenant_id);
      }
    }
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData deve ser usado dentro de DataProvider');
  }
  return context;
};
