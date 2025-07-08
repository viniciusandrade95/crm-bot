import React from 'react';
import { DataProvider, useData } from './contexts/DataContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import { Loader, ConfigurationError } from './components/ui/Feedback';
import { isConfigured } from './supabaseClient';

// Componente que decide o que mostrar: Loader, Login ou Dashboard
const AppContent = () => {
  const { session, loading } = useData();

  if (loading) {
    return <Loader text="A carregar aplicação..." />;
  }

  return session ? <DashboardPage /> : <LoginPage />;
};

// Componente principal que envolve a aplicação
export default function App() {
  // Se o Supabase não estiver configurado, mostra uma mensagem de erro clara.
  if (!isConfigured) {
    return <ConfigurationError />;
  }

  // O DataProvider "injeta" os dados de sessão e do negócio em toda a aplicação.
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}
