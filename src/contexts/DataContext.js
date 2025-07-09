import React, { useState, useEffect, createContext, useContext, useRef, useCallback } from 'react';
import { supabase, isConfigured } from '../supabaseClient';

const DataContext = createContext({});

export const DataProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [tenant, setTenant] = useState(null);
  
  // Add ref to track auto-login attempt
  const hasAttemptedAutoLogin = useRef(false);

  const fetchTenantData = useCallback(async (tenantId) => {
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
  }, []);

  // Separate function to handle session setup
  const handleSessionSetup = useCallback(async (session) => {
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
    setLoading(false);
  }, [fetchTenantData]); // Adicione fetchTenantData às dependências

  // Separate function for dev auto-login
  const attemptDevAutoLogin = async () => {
    console.log("Ambiente de desenvolvimento detectado. A tentar auto-login...");
    const { error: autoLoginError } = await supabase.auth.signInWithPassword({
      email: 'ouz10577@jioso.com',
      password: 'ouz10577@jioso.com',
    });

    if (autoLoginError) {
      console.error("Falha no auto-login:", autoLoginError.message);
      setLoading(false);
    }
    // If successful, onAuthStateChange will handle the rest
  };

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    // Check if we already have a session first
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        handleSessionSetup(session);
      } else if (process.env.NODE_ENV === 'development' && !hasAttemptedAutoLogin.current) {
        // Only attempt auto-login once per app instance
        hasAttemptedAutoLogin.current = true;
        attemptDevAutoLogin();
      } else {
        setLoading(false);
      }
    }, [handleSessionSetup]);

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) {
          handleSessionSetup(session);
        } else {
          setProfile(null);
          setTenant(null);
          setLoading(false);
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, [handleSessionSetup]);

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
