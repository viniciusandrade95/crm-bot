import React, { useState, useCallback } from 'react';
import { safeSupabase } from '../supabaseClient';
import { Bot, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAsyncOperation } from '../contexts/DataContext';

// Form validation helper
const validateForm = (email, password, isSignUp) => {
  const errors = {};
  
  if (!email) {
    errors.email = 'Email é obrigatório';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Email inválido';
  }
  
  if (!password) {
    errors.password = 'Senha é obrigatória';
  } else if (isSignUp && password.length < 6) {
    errors.password = 'Senha deve ter pelo menos 6 caracteres';
  }
  
  return errors;
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formErrors, setFormErrors] = useState({});
  
  const { loading, error, execute, clearError } = useAsyncOperation();

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setSuccessMessage('');
    setFormErrors({});
    clearError();
    
    // Validate form
    const errors = validateForm(email, password, isSignUp);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      await execute(async () => {
        if (isSignUp) {
          const { data, error } = await safeSupabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              data: {
                business_name: 'Meu Novo Negócio'
              }
            }
          });
          
          if (error) throw error;
          
          if (data.user && !data.session) {
            setSuccessMessage('Verifique seu email para confirmar o cadastro!');
          }
        } else {
          const { error } = await safeSupabase.auth.signInWithPassword({
            email: email.trim(),
            password
          });
          
          if (error) throw error;
        }
      });
    } catch (err) {
      // Error is handled by useAsyncOperation
      console.error('Login error:', err);
    }
  }, [email, password, isSignUp, execute, clearError]);

  const toggleMode = useCallback(() => {
    setIsSignUp(!isSignUp);
    setSuccessMessage('');
    setFormErrors({});
    clearError();
  }, [isSignUp, clearError]);

  const getErrorMessage = (error) => {
    if (!error) return '';
    
    // Map common Supabase errors to user-friendly messages
    const errorMessages = {
      'Invalid login credentials': 'Email ou senha incorretos',
      'User not found': 'Usuário não encontrado',
      'Email not confirmed': 'Email não confirmado. Verifique sua caixa de entrada.',
      'Password should be at least 6 characters': 'Senha deve ter pelo menos 6 caracteres',
      'User already registered': 'Este email já está registrado'
    };
    
    return errorMessages[error.message] || error.message;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-100 rounded-full mb-4">
              <Bot className="w-8 h-8 text-sky-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">WhatsApp CRM</h1>
            <p className="text-gray-600 mt-2">
              {isSignUp ? 'Crie sua conta para começar' : 'Bem-vindo de volta!'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition ${
                  formErrors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="seu@email.com"
                disabled={loading}
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition pr-12 ${
                    formErrors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
              )}
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="p-3 rounded-lg text-sm flex items-center bg-green-50 text-green-600">
                <CheckCircle className="w-4 h-4 mr-2" />
                {successMessage}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg text-sm flex items-center bg-red-50 text-red-600">
                <AlertCircle className="w-4 h-4 mr-2" />
                {getErrorMessage(error)}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-600 text-white py-3 rounded-lg font-medium hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Processando...' : (isSignUp ? 'Criar Conta' : 'Entrar')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={toggleMode}
              className="text-sky-600 hover:text-sky-700 text-sm font-medium"
              disabled={loading}
            >
              {isSignUp ? 'Já tem uma conta? Entre' : 'Não tem conta? Cadastre-se'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}