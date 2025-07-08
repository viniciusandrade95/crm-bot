import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || "COLE_AQUI_O_SEU_SUPABASE_URL";
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || "COLE_AQUI_A_SUA_CHAVE_ANON";

export const isConfigured = !supabaseUrl.includes("COLE_AQUI") && !supabaseAnonKey.includes("COLE_AQUI");

export const supabase = isConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;
