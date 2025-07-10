import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Settings, MessageSquare, Users, BarChart2, Power, Bot, Menu, X, Tag, Calendar } from 'lucide-react';
import { NotificationSystem } from '../components/NotificationSystem';

// Importa as diferentes "vistas" do painel
import DashboardOverview from '../components/DashboardOverview';
import { MessagesView } from '../components/MessagesView';
import { CustomersView } from '../components/CustomersView';
import { ServicesView } from '../components/ServicesView';
import { SettingsView } from '../components/SettingsView';
import { AppointmentsView } from '../components/AppointmentsView'; // Importa a nova vista

export default function DashboardPage() {
  const { signOut, session } = useData();
  const [currentView, setCurrentView] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
    { id: 'appointments', label: 'Agenda', icon: Calendar }, // Novo item de menu
    { id: 'messages', label: 'Conversas', icon: MessageSquare },
    { id: 'customers', label: 'Clientes', icon: Users },
    { id: 'services', label: 'Serviços', icon: Tag },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'appointments': return <AppointmentsView />; // Adiciona o novo case
      case 'messages': return <MessagesView />;
      case 'customers': return <CustomersView />;
      case 'services': return <ServicesView />;
      case 'settings': return <SettingsView />;
      default: return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-muted">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-64 bg-card border-r border-border flex-col">
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <div className="flex items-center">
            <Bot className="w-8 h-8 text-primary mr-3" />
            <h1 className="text-xl font-bold text-foreground">WhatsApp CRM</h1>
          </div>
          <NotificationSystem />
        </div>
        <nav className="flex-1 px-4 py-6">
          {menuItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => setCurrentView(item.id)} 
              className={`w-full flex items-center px-4 py-3 mb-1 rounded-md transition ${
                currentView === item.id ? 'bg-sky-50 text-primary' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="mb-4 p-3 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground truncate">{session?.user?.email}</p>
          </div>
          <button 
            onClick={signOut} 
            className="w-full flex items-center px-4 py-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-md transition"
          >
            <Power className="w-5 h-5 mr-3" />
            Terminar Sessão
          </button>
        </div>
      </aside>

      {/* Mobile Menu */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-card border-b border-border z-40">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <Bot className="w-8 h-8 text-primary mr-3" />
            <h1 className="text-xl font-bold text-foreground">CRM</h1>
          </div>
          <div className="flex items-center space-x-4">
            <NotificationSystem />
            <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md hover:bg-gray-100"
            >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
        </div>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-card z-50 pt-16">
          <nav className="px-4 py-6">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center px-4 py-3 mb-1 rounded-md ${
                  currentView === item.id ? 'bg-sky-50 text-primary' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            ))}
            <div className="mt-8 pt-8 border-t border-border">
              <div className="mb-4 p-3 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground truncate">{session?.user?.email}</p>
              </div>
              <button
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center px-4 py-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-md"
              >
                <Power className="w-5 h-5 mr-3" />
                Terminar Sessão
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">
          {renderView()}
        </div>
      </main>
    </div>
  );
}
