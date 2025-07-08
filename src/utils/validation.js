    // ==================================================================
// Ficheiro: src/utils/validation.js
// ==================================================================

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone number validation (Portuguese format)
export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^\+?351?[\s-]?[0-9]{3}[\s-]?[0-9]{3}[\s-]?[0-9]{3}$|^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone);
};

// Password validation
export const validatePassword = (password) => {
  return {
    isValid: password.length >= 6,
    minLength: password.length >= 6,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
};

// Business name validation
export const validateBusinessName = (name) => {
  return {
    isValid: name.trim().length >= 2 && name.trim().length <= 100,
    errors: []
  };
};

// Price validation
export const validatePrice = (price) => {
  if (!price) return { isValid: true, errors: [] };
  
  const priceRegex = /^\d+([.,]\d{1,2})?€?$/;
  const errors = [];
  
  if (!priceRegex.test(price.replace(/\s/g, ''))) {
    errors.push('Formato inválido. Use: 25.00€ ou 25,00€');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Service name validation
export const validateServiceName = (name) => {
  const errors = [];
  
  if (!name.trim()) {
    errors.push('Nome é obrigatório');
  } else if (name.trim().length < 2) {
    errors.push('Nome deve ter pelo menos 2 caracteres');
  } else if (name.trim().length > 100) {
    errors.push('Nome muito longo (máximo 100 caracteres)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Duration validation
export const validateDuration = (duration) => {
  if (!duration) return { isValid: true, errors: [] };
  
  const errors = [];
  
  if (duration.length > 50) {
    errors.push('Duração muito longa (máximo 50 caracteres)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Address validation
export const validateAddress = (address) => {
  if (!address) return { isValid: true, errors: [] };
  
  const errors = [];
  
  if (address.length > 200) {
    errors.push('Endereço muito longo (máximo 200 caracteres)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Working hours validation
export const validateWorkingHours = (hours) => {
  if (!hours) return { isValid: true, errors: [] };
  
  const errors = [];
  
  if (hours.length > 100) {
    errors.push('Horário muito longo (máximo 100 caracteres)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Generic form validation
export const validateForm = (fields, validators) => {
  const errors = {};
  let isValid = true;
  
  Object.keys(validators).forEach(fieldName => {
    const validator = validators[fieldName];
    const value = fields[fieldName];
    
    if (typeof validator === 'function') {
      const result = validator(value);
      if (!result.isValid) {
        errors[fieldName] = result.errors[0] || 'Campo inválido';
        isValid = false;
      }
    }
  });
  
  return { isValid, errors };
};

// Sanitize input (basic XSS protection)
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Clean phone number for storage
export const cleanPhoneNumber = (phone) => {
  return phone.replace(/[\s\-\(\)]/g, '');
};

// Format phone number for display
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  const cleaned = cleanPhoneNumber(phone);
  
  // Portuguese mobile format
  if (cleaned.startsWith('+351') || cleaned.startsWith('351')) {
    const number = cleaned.replace(/^\+?351/, '');
    if (number.length === 9) {
      return `+351 ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
    }
  }
  
  return phone;
};

// Format price for display
export const formatPrice = (price) => {
  if (!price) return '';
  
  const cleaned = price.replace(/[^\d.,]/g, '');
  if (cleaned.includes(',')) {
    return cleaned.replace(',', '.') + (price.includes('€') ? '' : '€');
  }
  
  return cleaned + (price.includes('€') ? '' : '€');
};

// Validate environment variables
export const validateEnvironmentVariables = () => {
  const required = [
    'REACT_APP_SUPABASE_URL',
    'REACT_APP_SUPABASE_ANON_KEY'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  const invalid = [];
  
  if (process.env.REACT_APP_SUPABASE_URL && !process.env.REACT_APP_SUPABASE_URL.startsWith('https://')) {
    invalid.push('REACT_APP_SUPABASE_URL must start with https://');
  }
  
  if (process.env.REACT_APP_SUPABASE_ANON_KEY && process.env.REACT_APP_SUPABASE_ANON_KEY.length < 20) {
    invalid.push('REACT_APP_SUPABASE_ANON_KEY appears to be invalid');
  }
  
  return {
    isValid: missing.length === 0 && invalid.length === 0,
    missing,
    invalid
  };
};