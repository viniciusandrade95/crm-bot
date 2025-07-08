// ==================================================================
// Ficheiro: src/constants/index.js
// ==================================================================

// Application constants
export const APP_NAME = 'WhatsApp CRM';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Sistema de gestão de conversas WhatsApp';

// API Configuration
export const API_TIMEOUT = 10000; // 10 seconds
export const MAX_RETRIES = 3;
export const RETRY_DELAY = 1000; // 1 second

// UI Constants
export const NOTIFICATION_DURATION = 3000; // 3 seconds
export const DEBOUNCE_DELAY = 300; // 300ms
export const LOADING_DELAY = 100; // 100ms

// Form validation constants
export const VALIDATION_RULES = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Email inválido'
  },
  password: {
    required: true,
    minLength: 6,
    message: 'Senha deve ter pelo menos 6 caracteres'
  },
  businessName: {
    required: true,
    minLength: 2,
    maxLength: 100,
    message: 'Nome deve ter entre 2 e 100 caracteres'
  },
  phone: {
    pattern: /^\+?[\d\s\-\(\)]+$/,
    message: 'Formato de telefone inválido'
  },
  serviceName: {
    required: true,
    minLength: 2,
    maxLength: 100,
    message: 'Nome do serviço deve ter entre 2 e 100 caracteres'
  },
  price: {
    pattern: /^\d+([.,]\d{1,2})?€?$/,
    message: 'Formato de preço inválido (ex: 25.00€)'
  },
  duration: {
    maxLength: 50,
    message: 'Duração muito longa (máximo 50 caracteres)'
  },
  address: {
    maxLength: 200,
    message: 'Endereço muito longo (máximo 200 caracteres)'
  },
  workingHours: {
    maxLength: 100,
    message: 'Horário muito longo (máximo 100 caracteres)'
  }
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
  UNAUTHORIZED: 'Não autorizado. Faça login novamente.',
  FORBIDDEN: 'Acesso negado.',
  NOT_FOUND: 'Recurso não encontrado.',
  VALIDATION_ERROR: 'Dados inválidos. Verifique os campos.',
  SERVER_ERROR: 'Erro interno do servidor. Tente novamente.',
  SUPABASE_NOT_CONFIGURED: 'Supabase não configurado. Verifique as variáveis de ambiente.',
  UNKNOWN_ERROR: 'Erro desconhecido. Tente novamente.',
  
  // Auth specific
  INVALID_CREDENTIALS: 'Email ou senha incorretos.',
  EMAIL_NOT_CONFIRMED: 'Email não confirmado. Verifique sua caixa de entrada.',
  USER_NOT_FOUND: 'Usuário não encontrado.',
  EMAIL_ALREADY_REGISTERED: 'Este email já está registrado.',
  WEAK_PASSWORD: 'Senha muito fraca. Use pelo menos 6 caracteres.',
  
  // Business logic
  TENANT_NOT_FOUND: 'Negócio não encontrado.',
  SERVICE_NOT_FOUND: 'Serviço não encontrado.',
  CUSTOMER_NOT_FOUND: 'Cliente não encontrado.',
  MESSAGE_NOT_FOUND: 'Mensagem não encontrada.'
};

// Success messages
export const SUCCESS_MESSAGES = {
  SETTINGS_SAVED: 'Configurações salvas com sucesso!',
  SERVICE_CREATED: 'Serviço criado com sucesso!',
  SERVICE_UPDATED: 'Serviço atualizado com sucesso!',
  SERVICE_DELETED: 'Serviço removido com sucesso!',
  PROFILE_UPDATED: 'Perfil atualizado com sucesso!',
  PASSWORD_CHANGED: 'Senha alterada com sucesso!',
  EMAIL_SENT: 'Email enviado com sucesso!',
  DATA_REFRESHED: 'Dados atualizados com sucesso!'
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  MESSAGES: '/messages',
  CUSTOMERS: '/customers',
  SERVICES: '/services',
  SETTINGS: '/settings'
};

// Theme colors
export const COLORS = {
  primary: '#0284c7', // sky-600
  primaryHover: '#0369a1', // sky-700
  secondary: '#64748b', // slate-500
  success: '#059669', // emerald-600
  error: '#dc2626', // red-600
  warning: '#d97706', // amber-600
  info: '#0284c7', // sky-600
  gray: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a'
  }
};

// Database table names
export const TABLES = {
  PROFILES: 'profiles',
  TENANTS: 'tenants',
  SERVICES: 'services',
  CUSTOMERS: 'customers',
  MESSAGE_HISTORY: 'message_history',
  CONVERSATIONS: 'conversations'
};

// Supabase RPC functions
export const RPC_FUNCTIONS = {
  GET_DASHBOARD_METRICS: 'get_dashboard_metrics',
  GET_CONVERSATIONS: 'get_conversations',
  GET_CUSTOMER_STATS: 'get_customer_stats'
};

// File upload constants
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  MAX_FILES: 10
};

// Pagination constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1
};

// Date/Time formats
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  DISPLAY_WITH_TIME: 'dd/MM/yyyy HH:mm',
  TIME_ONLY: 'HH:mm',
  ISO: 'yyyy-MM-dd\'T\'HH:mm:ss.SSSxxx'
};

// Regex patterns
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_PT: /^\+?351?[\s-]?[0-9]{3}[\s-]?[0-9]{3}[\s-]?[0-9]{3}$/,
  PHONE_INTERNATIONAL: /^\+?[\d\s\-\(\)]+$/,
  PRICE: /^\d+([.,]\d{1,2})?€?$/,
  URL: /^https?:\/\/.+/
};

// Environment variables
export const ENV = {
  SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY,
  ENVIRONMENT: process.env.REACT_APP_ENVIRONMENT || 'development',
  DEBUG_MODE: process.env.REACT_APP_DEBUG_MODE === 'true',
  ENABLE_ANALYTICS: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
  ENABLE_ERROR_TRACKING: process.env.REACT_APP_ENABLE_ERROR_TRACKING === 'true'
};

// Feature flags
export const FEATURES = {
  ANALYTICS: ENV.ENABLE_ANALYTICS,
  ERROR_TRACKING: ENV.ENABLE_ERROR_TRACKING,
  DEBUG_MODE: ENV.DEBUG_MODE,
  REAL_TIME_MESSAGES: true,
  CUSTOMER_MANAGEMENT: false, // Not implemented yet
  ADVANCED_REPORTING: false, // Not implemented yet
  MULTI_LANGUAGE: false // Not implemented yet
};

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'whatsapp-crm-theme',
  LANGUAGE: 'whatsapp-crm-language',
  SIDEBAR_COLLAPSED: 'whatsapp-crm-sidebar-collapsed',
  LAST_VISIT: 'whatsapp-crm-last-visit',
  USER_PREFERENCES: 'whatsapp-crm-user-preferences'
};

// Animation durations (in milliseconds)
export const ANIMATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
};

// Breakpoints for responsive design
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1536
};

export default {
  APP_NAME,
  APP_VERSION,
  APP_DESCRIPTION,
  API_TIMEOUT,
  MAX_RETRIES,
  RETRY_DELAY,
  NOTIFICATION_DURATION,
  DEBOUNCE_DELAY,
  LOADING_DELAY,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ROUTES,
  COLORS,
  TABLES,
  RPC_FUNCTIONS,
  FILE_UPLOAD,
  PAGINATION,
  DATE_FORMATS,
  REGEX,
  ENV,
  FEATURES,
  STORAGE_KEYS,
  ANIMATIONS,
  BREAKPOINTS
};