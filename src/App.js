import React from 'react';
import { DataProvider, useData } from './contexts/DataContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import { Loader, ConfigurationError } from './components/ui/Feedback';
import { isConfigured } from './supabaseClient';
import ErrorBoundary from './components/ErrorBoundary';

// Component that decides what to show: Error, Loader, Login, or Dashboard
const AppContent = () => {
  const { session, loading, error, clearError } = useData();

  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Erro de Configuração
          </h1>
          
          <p className="text-gray-600 mb-4">
            {error.message}
          </p>
          
          <p className="text-sm text-gray-500 mb-6">
            Contexto: {error.context}
          </p>
          
          <button
            onClick={clearError}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return <Loader text="A carregar aplicação..." />;
  }

  // Show appropriate page based on session
  return session ? <DashboardPage /> : <LoginPage />;
};

// Main App component
export default function App() {
  // If Supabase isn't configured, show configuration error
  if (!isConfigured) {
    return <ConfigurationError />;
  }

  return (
    <ErrorBoundary>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </ErrorBoundary>
  );
}