import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase, isConfigured } from '../supabaseClient';

const DataContext = createContext({});

export const DataProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [error, setError] = useState(null);

  const clearError = () => setError(null);

  const fetchTenantData = async (tenantId) => {
    if (!tenantId) {
      setTenant(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*, services(*)')
        .eq('id', tenantId)
        .single();
      
      if (error) throw error;
      setTenant(data);
    } catch (error) {
      console.error('Error fetching tenant:', error);
      setTenant(null);
    }
  };

  const fetchProfileData = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      setProfile(data);
      
      if (data?.tenant_id) {
        await fetchTenantData(data.tenant_id);
      } else {
        setTenant(null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
      setTenant(null);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const refreshTenant = async () => {
    if (profile?.tenant_id) {
      await fetchTenantData(profile.tenant_id);
    }
  };

  useEffect(() => {
    if (!isConfigured) {
      setError({ message: 'Supabase not configured', context: 'configuration' });
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        clearError();

        if (session?.user) {
          await fetchProfileData(session.user.id);
        } else {
          setProfile(null);
          setTenant(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const value = {
    session,
    profile,
    tenant,
    loading,
    error,
    signOut,
    refreshTenant,
    clearError,
    isAuthenticated: !!session,
    hasProfile: !!profile,
    hasTenant: !!tenant,
    isConfigured
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const useAsyncOperation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const execute = async (operation) => {
    try {
      setLoading(true);
      setError(null);
      const result = await operation();
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const clearError = () => setError(null);
  
  return { loading, error, execute, clearError };
};