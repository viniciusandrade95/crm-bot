// ==================================================================
// Ficheiro: src/components/NotificationSystem.js
// ==================================================================
import React, { useState, useEffect } from 'react';
import { Bell, X, MessageSquare, User, Calendar, AlertCircle } from 'lucide-react';

export function NotificationSystem() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  // Simular novas notificações (substituir com real-time do Supabase)
  useEffect(() => {
    // Exemplo de notificações
    const mockNotifications = [
      {
        id: 1,
        type: 'message',
        title: 'Nova mensagem',
        description: 'João Silva enviou uma mensagem',
        time: new Date(Date.now() - 5 * 60000), // 5 min atrás
        read: false
      },
      {
        id: 2,
        type: 'customer',
        title: 'Novo cliente',
        description: '+351 999 888 777 contactou pela primeira vez',
        time: new Date(Date.now() - 30 * 60000), // 30 min atrás
        read: false
      },
      {
        id: 3,
        type: 'appointment',
        title: 'Marcação próxima',
        description: 'Maria Santos tem marcação em 1 hora',
        time: new Date(Date.now() - 60 * 60000), // 1 hora atrás
        read: true
      }
    ];
    
    setNotifications(mockNotifications);
    setHasUnread(mockNotifications.some(n => !n.read));
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-5 h-5 text-primary" />;
      case 'customer':
        return <User className="w-5 h-5 text-green-600" />;
      case 'appointment':
        return <Calendar className="w-5 h-5 text-purple-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getTimeAgo = (date) => {
    const minutes = Math.floor((Date.now() - date) / 60000);
    if (minutes < 60) return `${minutes} min atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setHasUnread(false);
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="relative">
      {/* Botão do sino */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-gray-100 rounded-md transition"
      >
        <Bell className="w-6 h-6" />
        {hasUnread && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive/100 rounded-full"></span>
        )}
      </button>

      {/* Dropdown de notificações */}
      {isOpen && (
        <>
          {/* Overlay para fechar ao clicar fora */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          ></div>
          
          {/* Painel de notificações */}
          <div className="absolute right-0 mt-2 w-96 bg-card rounded-lg shadow-2xl border border-border z-20">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Notificações</h3>
              <div className="flex items-center space-x-2">
                {hasUnread && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-primary hover:text-sky-700"
                  >
                    Marcar todas como lidas
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Lista de notificações */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Sem notificações</p>
                </div>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 hover:bg-muted transition ${
                      !notification.read ? 'bg-sky-50' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">
                          {notification.title}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {getTimeAgo(notification.time)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="flex-shrink-0 p-1 hover:bg-secondary rounded"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Rodapé */}
            {notifications.length > 0 && (
              <div className="p-3 text-center border-t border-border">
                <button className="text-sm text-primary hover:text-sky-700 font-medium">
                  Ver todas as notificações
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}