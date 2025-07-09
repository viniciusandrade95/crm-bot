import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase, isConfigured } from '../supabaseClient';

const DataContext = createContext({});

export const DataProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true); // O estado inicial de loading é true.
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
      // Se não houver sessão e estivermos em desenvolvimento, tenta fazer login automático.
      if (!session && process.env.NODE_ENV === 'development') {
        console.log("Ambiente de desenvolvimento detectado. A tentar auto-login...");
        const { error: autoLoginError } = await supabase.auth.signInWithPassword({
          email: 'ouz10577@jioso.com',
          password: 'ouz10577@jioso.com',
        });

        if (autoLoginError) {
          console.error("Falha no auto-login:", autoLoginError.message);
          setLoading(false);
          return;
        }
        return; 
      }

      setSession(session);
      // **CORREÇÃO:** A linha `setLoading(true)` foi removida daqui para evitar o loop.

      if (session?.user) {
        try {
          let { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError && profileError.code === 'PGRST116') {
            const { error: rpcError } = await supabase.rpc('setup_new_user');
            if (rpcError) throw new Error(`Erro ao configurar novo utilizador: ${rpcError.message}`);

            const { data: newProfileData, error: newProfileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (newProfileError) throw newProfileError;
            profileData = newProfileData;
          } else if (profileError) {
            throw profileError;
          }
          
          setProfile(profileData);

          if (profileData?.tenant_id) {
            await fetchTenantData(profileData.tenant_id);
          } else {
            setTenant(null);
          }

        } catch (error) {
          console.error("Erro no fluxo de autenticação/criação de perfil:", error);
          setProfile(null);
          setTenant(null);
        }
      } else {
        setProfile(null);
        setTenant(null);
      }
      
      // O estado de loading é definido como false aqui, no final de todo o processo.
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
