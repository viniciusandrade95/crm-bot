import { createClient } from '@supabase/supabase-js';

// Valida as variáveis de ambiente
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// ==================================================================
// LINHA DE DEPURAÇÃO ADICIONADA
// Isto irá mostrar no console do navegador os valores que estão a ser usados.
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Encontrada (***)' : 'NÃO ENCONTRADA');
// ==================================================================

// Verifica se a configuração é válida
export const isConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 20 // Validação básica
);

// Cria o cliente apenas se estiver corretamente configurado
export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

// Wrapper seguro para operações do supabase
export const safeSupabase = {
  auth: {
    signInWithPassword: async (credentials) => {
      if (!supabase) throw new Error('Supabase não configurado');
      return supabase.auth.signInWithPassword(credentials);
    },
    signUp: async (credentials) => {
      if (!supabase) throw new Error('Supabase não configurado');
      return supabase.auth.signUp(credentials);
    },
    signOut: async () => {
      if (!supabase) throw new Error('Supabase não configurado');
      return supabase.auth.signOut();
    },
    onAuthStateChange: (callback) => {
      if (!supabase) throw new Error('Supabase não configurado');
      return supabase.auth.onAuthStateChange(callback);
    }
  },
  from: (table) => {
    if (!supabase) throw new Error('Supabase não configurado');
    return supabase.from(table);
  },
  rpc: (functionName, params) => {
    if (!supabase) throw new Error('Supabase não configurado');
    return supabase.rpc(functionName, params);
  }
};

// Função auxiliar de validação do ambiente
export const validateEnvironment = () => {
  const errors = [];
  
  if (!supabaseUrl) {
    errors.push('REACT_APP_SUPABASE_URL is not set');
  } else if (!supabaseUrl.startsWith('https://')) {
    errors.push('REACT_APP_SUPABASE_URL must start with https://');
  }
  
  if (!supabaseAnonKey) {
    errors.push('REACT_APP_SUPABASE_ANON_KEY is not set');
  } else if (supabaseAnonKey.length < 20) {
    errors.push('REACT_APP_SUPABASE_ANON_KEY appears to be invalid');
  }
  
  return errors;
};
