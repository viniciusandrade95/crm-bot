// ==================================================================
// Ficheiro: src/hooks/useUtilities.js
// ==================================================================
import { useState, useEffect, useCallback, useRef } from 'react';

// Hook for debouncing values
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook for tracking if component is mounted
export const useIsMounted = () => {
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return isMountedRef;
};

// Hook for safe state updates
export const useSafeState = (initialState) => {
  const [state, setState] = useState(initialState);
  const isMountedRef = useIsMounted();

  const safeSetState = useCallback((newState) => {
    if (isMountedRef.current) {
      setState(newState);
    }
  }, [isMountedRef]);

  return [state, safeSetState];
};

// Hook for local storage with error handling
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};

// Hook for managing notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    const notification = { id, message, type, duration };
    
    setNotifications(prev => [...prev, notification]);

    if (duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll
  };
};

// Hook for form validation
export const useFormValidation = (initialValues, validators) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = useCallback(() => {
    const newErrors = {};
    
    Object.keys(validators).forEach(field => {
      const validator = validators[field];
      const value = values[field];
      
      if (typeof validator === 'function') {
        const result = validator(value);
        if (!result.isValid) {
          newErrors[field] = result.errors[0] || 'Campo inválido';
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validators]);

  const handleChange = useCallback((field, value) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const handleBlur = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const handleSubmit = useCallback(async (onSubmit) => {
    setIsSubmitting(true);
    setTouched(Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    
    if (validate()) {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }
    
    setIsSubmitting(false);
  }, [values, validate]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    validate
  };
};

// Hook for handling API calls
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMountedRef = useIsMounted();

  const execute = useCallback(async (apiCall) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiCall();
      
      if (isMountedRef.current) {
        setLoading(false);
      }
      
      return result;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err);
        setLoading(false);
      }
      throw err;
    }
  }, [isMountedRef]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { loading, error, execute, clearError };
};

// Hook for handling clipboard operations
export const useClipboard = () => {
  const [copiedText, setCopiedText] = useState('');

  const copy = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(''), 2000);
      return true;
    } catch (error) {
      console.error('Failed to copy text:', error);
      return false;
    }
  }, []);

  return { copiedText, copy };
};

// Hook for handling window size
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

// Hook for handling keyboard shortcuts
export const useKeyboardShortcut = (keys, callback, options = {}) => {
  const { preventDefault = true, stopPropagation = true } = options;

  useEffect(() => {
    const handleKeyDown = (event) => {
      const isMatch = keys.every(key => {
        if (key === 'ctrl') return event.ctrlKey;
        if (key === 'alt') return event.altKey;
        if (key === 'shift') return event.shiftKey;
        if (key === 'meta') return event.metaKey;
        return event.key.toLowerCase() === key.toLowerCase();
      });

      if (isMatch) {
        if (preventDefault) event.preventDefault();
        if (stopPropagation) event.stopPropagation();
        callback(event);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [keys, callback, preventDefault, stopPropagation]);
};

// Hook for handling outside clicks
export const useOutsideClick = (ref, callback) => {
  useEffect(() => {
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback(event);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, callback]);
};