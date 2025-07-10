// ==================================================================
// Ficheiro: src/services/errorService.js
// ==================================================================
import { ERROR_MESSAGES, ENV } from '../constants';

// Error types
export const ERROR_TYPES = {
  NETWORK: 'NETWORK',
  VALIDATION: 'VALIDATION',
  AUTHENTICATION: 'AUTHENTICATION',
  AUTHORIZATION: 'AUTHORIZATION',
  NOT_FOUND: 'NOT_FOUND',
  SERVER: 'SERVER',
  CLIENT: 'CLIENT',
  SUPABASE: 'SUPABASE',
  UNKNOWN: 'UNKNOWN'
};

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

// Custom error class
export class AppError extends Error {
  constructor(message, type = ERROR_TYPES.UNKNOWN, severity = ERROR_SEVERITY.MEDIUM, originalError = null) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.severity = severity;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
    
    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

// Error handler class
class ErrorHandler {
  constructor() {
    this.errorListeners = [];
    this.setupGlobalErrorHandlers();
  }

  // Setup global error handlers
  setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.handleError(
        new AppError(
          'Erro não tratado na aplicação',
          ERROR_TYPES.CLIENT,
          ERROR_SEVERITY.HIGH,
          event.reason
        )
      );
    });

    // Handle general JavaScript errors
    window.addEventListener('error', (event) => {
      console.error('JavaScript error:', event.error);
      this.handleError(
        new AppError(
          'Erro de JavaScript',
          ERROR_TYPES.CLIENT,
          ERROR_SEVERITY.HIGH,
          event.error
        )
      );
    });
  }

  // Add error listener
  addErrorListener(listener) {
    this.errorListeners.push(listener);
  }

  // Remove error listener
  removeErrorListener(listener) {
    this.errorListeners = this.errorListeners.filter(l => l !== listener);
  }

  // Handle error
  handleError(error, context = {}) {
    const processedError = this.processError(error, context);
    
    // Log error based on severity
    this.logError(processedError);
    
    // Notify error listeners
    this.errorListeners.forEach(listener => {
      try {
        listener(processedError);
      } catch (err) {
        console.error('Error in error listener:', err);
      }
    });
    
    // Send to error tracking service (if enabled)
    if (ENV.ENABLE_ERROR_TRACKING) {
      this.sendToErrorTracking(processedError);
    }
    
    return processedError;
  }

  // Process error to standardize format
  processError(error, context = {}) {
    if (error instanceof AppError) {
      return { ...error, context };
    }
    
    // Handle Supabase errors
    if (error?.message?.includes('supabase') || error?.code) {
      return new AppError(
        this.getSupabaseErrorMessage(error),
        ERROR_TYPES.SUPABASE,
        ERROR_SEVERITY.MEDIUM,
        error
      );
    }
    
    // Handle network errors
    if (error?.message?.includes('fetch') || error?.message?.includes('network')) {
      return new AppError(
        ERROR_MESSAGES.NETWORK_ERROR,
        ERROR_TYPES.NETWORK,
        ERROR_SEVERITY.HIGH,
        error
      );
    }
    
    // Handle validation errors
    if (error?.message?.includes('validation') || error?.message?.includes('invalid')) {
      return new AppError(
        ERROR_MESSAGES.VALIDATION_ERROR,
        ERROR_TYPES.VALIDATION,
        ERROR_SEVERITY.LOW,
        error
      );
    }
    
    // Default to unknown error
    return new AppError(
      error?.message || ERROR_MESSAGES.UNKNOWN_ERROR,
      ERROR_TYPES.UNKNOWN,
      ERROR_SEVERITY.MEDIUM,
      error
    );
  }

  // Get user-friendly message for Supabase errors
  getSupabaseErrorMessage(error) {
    const message = error?.message || '';
    
    // Map common Supabase errors to user-friendly messages
    if (message.includes('Invalid login credentials')) {
      return ERROR_MESSAGES.INVALID_CREDENTIALS;
    }
    if (message.includes('Email not confirmed')) {
      return ERROR_MESSAGES.EMAIL_NOT_CONFIRMED;
    }
    if (message.includes('User not found')) {
      return ERROR_MESSAGES.USER_NOT_FOUND;
    }
    if (message.includes('User already registered')) {
      return ERROR_MESSAGES.EMAIL_ALREADY_REGISTERED;
    }
    if (message.includes('Password should be at least')) {
      return ERROR_MESSAGES.WEAK_PASSWORD;
    }
    if (message.includes('JWT expired')) {
      return ERROR_MESSAGES.UNAUTHORIZED;
    }
    
    return message || ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  // Log error based on severity
  logError(error) {
    const logMessage = `[${error.severity}] ${error.type}: ${error.message}`;
    
    switch (error.severity) {
      case ERROR_SEVERITY.LOW:
        console.info(logMessage, error);
        break;
      case ERROR_SEVERITY.MEDIUM:
        console.warn(logMessage, error);
        break;
      case ERROR_SEVERITY.HIGH:
      case ERROR_SEVERITY.CRITICAL:
        console.error(logMessage, error);
        break;
      default:
        console.log(logMessage, error);
    }
  }

  // Send error to tracking service (placeholder)
  sendToErrorTracking(error) {
    // In production, you would send this to Sentry, LogRocket, etc.
    if (ENV.ENVIRONMENT === 'production') {
      // Example: Sentry.captureException(error);
      console.log('Would send to error tracking:', error);
    }
  }

  // Create specific error types
  createNetworkError(message, originalError = null) {
    return new AppError(message, ERROR_TYPES.NETWORK, ERROR_SEVERITY.HIGH, originalError);
  }

  createValidationError(message, originalError = null) {
    return new AppError(message, ERROR_TYPES.VALIDATION, ERROR_SEVERITY.LOW, originalError);
  }

  createAuthError(message, originalError = null) {
    return new AppError(message, ERROR_TYPES.AUTHENTICATION, ERROR_SEVERITY.MEDIUM, originalError);
  }

  createSupabaseError(message, originalError = null) {
    return new AppError(message, ERROR_TYPES.SUPABASE, ERROR_SEVERITY.MEDIUM, originalError);
  }

  createNotFoundError(message, originalError = null) {
    return new AppError(message, ERROR_TYPES.NOT_FOUND, ERROR_SEVERITY.LOW, originalError);
  }

  createServerError(message, originalError = null) {
    return new AppError(message, ERROR_TYPES.SERVER, ERROR_SEVERITY.HIGH, originalError);
  }
}

// Create singleton instance
const errorHandler = new ErrorHandler();

// Helper functions for common error scenarios
export const handleSupabaseError = (error, context = {}) => {
  return errorHandler.handleError(error, { ...context, source: 'supabase' });
};

export const handleNetworkError = (error, context = {}) => {
  return errorHandler.handleError(
    errorHandler.createNetworkError(ERROR_MESSAGES.NETWORK_ERROR, error),
    context
  );
};

export const handleValidationError = (message, context = {}) => {
  return errorHandler.handleError(
    errorHandler.createValidationError(message),
    context
  );
};

export const handleAuthError = (error, context = {}) => {
  return errorHandler.handleError(
    errorHandler.createAuthError(ERROR_MESSAGES.UNAUTHORIZED, error),
    context
  );
};

// Retry logic for failed operations
export const withRetry = async (operation, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on validation or auth errors
      if (error instanceof AppError && 
          (error.type === ERROR_TYPES.VALIDATION || error.type === ERROR_TYPES.AUTHENTICATION)) {
        throw error;
      }
      
      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        throw errorHandler.handleError(error, { attempts: attempt });
      }
      
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
};

// Safe async wrapper that handles errors
export const safeAsync = async (operation, fallback = null) => {
  try {
    return await operation();
  } catch (error) {
    errorHandler.handleError(error, { context: 'safeAsync' });
    return fallback;
  }
};

// Error boundary helper
export const withErrorBoundary = (WrappedComponent) => {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
      errorHandler.handleError(error, { 
        context: 'ErrorBoundary',
        componentStack: errorInfo.componentStack 
      });
    }

    render() {
      if (this.state.hasError) {
        return (
          <div className="min-h-screen bg-destructive/10 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-card rounded-2xl shadow-xl p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Algo deu errado
              </h1>
              <p className="text-muted-foreground mb-6">
                Ocorreu um erro inesperado. A página será recarregada.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 text-primary-foreground px-4 py-2 rounded-md hover:bg-red-700 transition"
              >
                Recarregar Página
              </button>
            </div>
          </div>
        );
      }

      return <WrappedComponent {...this.props} />;
    }
  };
};

// Export the error handler instance
export default errorHandler;