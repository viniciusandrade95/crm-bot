import React, { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react';
import { safeSupabase, isConfigured, validateEnvironment } from '../supabaseClient';

// Create the Context
const DataContext = createContext({});

// Create the Data Provider
export const DataProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [error, setError] = useState(null);
  
  // Ref to track if component is mounted
  const isMountedRef = useRef(true);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Safe state setter that checks if component is mounted
  const safeSetState = useCallback((setter, value) => {
    if (isMountedRef.current) {
      setter(value);
    }
  }, []);

  // Error handler
  const handleError = useCallback((error, context) => {
    console.error(`Error in ${context}:`, error);
    safeSetState(setError, { message: error.message, context });
  }, [safeSetState]);

  // Clear error
  const clearError = useCallback(() => {
    safeSetState(setError, null);
  }, [safeSetState]);

  // Function to fetch tenant data with error handling
  const fetchTenantData = useCallback(async (tenantId) => {
    if (!tenantId) {
      safeSetState(setTenant, null);
      return;
    }

    try {
      const { data: tenantData, error } = await safeSupabase
        .from('tenants')
        .select('*, services(*)')
        .eq('id', tenantId)
        .order('service_name', { foreignTable: 'services' })
        .single();
      
      if (error) throw error;
      
      safeSetState(setTenant, tenantData);
    } catch (error) {
      handleError(error, 'fetchTenantData');
      safeSetState(setTenant, null);
    }
  }, [safeSetState, handleError]);

  // Function to fetch profile data
  const fetchProfileData = useCallback(async (userId) => {
    try {
      const { data: profileData, error } = await safeSupabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // Not found is OK
        throw error;
      }
      
      safeSetState(setProfile, profileData);
      
      if (profileData?.tenant_id) {
        await fetchTenantData(profileData.tenant_id);
      } else {
        safeSetState(setTenant, null);
      }
    } catch (error) {
      handleError(error, 'fetchProfileData');
      safeSetState(setProfile, null);
      safeSetState(setTenant, null);
    }
  }, [safeSetState, handleError, fetchTenantData]);

  // Auth state change handler
  const handleAuthStateChange = useCallback(async (event, session) => {
    try {
      safeSetState(setSession, session);
      clearError();

      if (session?.user) {
        await fetchProfileData(session.user.id);
      } else {
        safeSetState(setProfile, null);
        safeSetState(setTenant, null);
      }
    } catch (error) {
      handleError(error, 'handleAuthStateChange');
    } finally {
      safeSetState(setLoading, false);
    }
  }, [safeSetState, clearError, fetchProfileData, handleError]);

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      clearError();
      await safeSupabase.auth.signOut();
    } catch (error) {
      handleError(error, 'signOut');
    } finally {
      setLoading(false);
    }
  }, [clearError, handleError]);

  // Refresh tenant data
  const refreshTenant = useCallback(async () => {
    if (profile?.tenant_id) {
      await fetchTenantData(profile.tenant_id);
    }
  }, [profile?.tenant_id, fetchTenantData]);

  useEffect(() => {
    if (!isConfigured) {
      const envErrors = validateEnvironment();
      handleError(
        new Error(`Supabase not configured: ${envErrors.join(', ')}`),
        'configuration'
      );
      setLoading(false);
      return;
    }

    let subscription;
    
    try {
      const { data } = safeSupabase.auth.onAuthStateChange(handleAuthStateChange);
      subscription = data;
    } catch (error) {
      handleError(error, 'auth subscription');
      setLoading(false);
    }

    return () => {
      subscription?.unsubscribe();
    };
  }, [handleAuthStateChange, handleError]);

  // Value to be shared with the entire application
  const value = {
    session,
    profile,
    tenant,
    loading,
    error,
    signOut,
    refreshTenant,
    clearError,
    // Additional utilities
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

// Custom hook to use the data context
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Hook for handling async operations with loading and error states
export const useAsyncOperation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const execute = useCallback(async (operation) => {
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
  }, []);
  
  const clearError = useCallback(() => setError(null), []);
  
  return { loading, error, execute, clearError };
};