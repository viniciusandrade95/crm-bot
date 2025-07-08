// ==================================================================
// Ficheiro: src/components/MessagesView.js
// ==================================================================
import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { supabase } from '../supabaseClient';
import { Bot, User, Send, Loader2, MessageSquare as MessageSquareIcon } from 'lucide-react';
import { Loader } from './ui/Feedback';

export function MessagesView() {
  const { tenant, loading: contextLoading } = useData();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(true);

  useEffect(() => {
    if (tenant?.id) {
      const fetchConversations = async () => {
        setLoadingMessages(true);
        const { data, error } = await supabase.rpc('get_conversations', {
          p_tenant_id: tenant.id
        });
        
        if (error) {
          console.error("Erro ao buscar conversas:", error);
        } else {
          setConversations(data || []);
        }
        setLoadingMessages(false);
      };
      fetchConversations();
    } else if (!contextLoading) {
        setLoadingMessages(false);
    }
  }, [tenant, contextLoading]);

  const messages = useMemo(() => {
    if (!selectedConversation) return [];
    return selectedConversation.messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }, [selectedConversation]);

  const handleSelectConversation = async (conversation) => {
    setLoadingMessages(true);
    const { data, error } = await supabase
      .from('message_history')
      .select('*')
      .eq('tenant_id', tenant.id)
      .eq('phone_number', conversation.phone_number)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Erro ao buscar mensagens da conversa:", error);
    } else {
      setSelectedConversation({
        phone_number: conversation.phone_number,
        messages: data
      });
    }
    setLoadingMessages(false);
  };

  if (contextLoading) return <Loader text="A carregar dados..." />;
  if (!tenant) return <div className="text-center p-8 bg-white rounded-lg shadow-sm">Configure o seu negócio para ver as conversas.</div>;

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm">
      <div className="w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Conversas</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingMessages && conversations.length === 0 && <Loader text="A buscar..." />}
          {!loadingMessages && conversations.length === 0 && <p className="p-4 text-sm text-gray-500">Nenhuma conversa encontrada.</p>}
          {conversations.map((convo) => (
            <button
              key={convo.phone_number}
              onClick={() => handleSelectConversation(convo)}
              className={`w-full text-left p-4 border-b border-gray-100 hover:bg-sky-50 transition ${
                selectedConversation?.phone_number === convo.phone_number ? 'bg-sky-100' : ''
              }`}
            >
              <div className="font-semibold text-gray-800">{convo.phone_number}</div>
              <p className="text-sm text-gray-500 truncate">{convo.last_message}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(convo.last_message_at).toLocaleString('pt-PT')}</p>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-bold text-lg text-gray-900">{selectedConversation.phone_number}</h3>
            </div>
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex items-start gap-2 ${msg.bot_response ? '' : 'justify-end'}`}>
                  {msg.bot_response && <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0"><Bot className="w-5 h-5 text-sky-600" /></div>}
                  <div className="flex flex-col max-w-[70%]">
                    <div className={`p-3 rounded-2xl ${msg.bot_response ? 'bg-white text-gray-800 rounded-tl-none shadow-sm' : 'bg-sky-600 text-white rounded-tr-none'}`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.bot_response || msg.user_message}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 px-1">{new Date(msg.created_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  {msg.user_message && !msg.bot_response && <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0"><User className="w-5 h-5 text-green-600" /></div>}
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="relative">
                <input type="text" placeholder="Responder manualmente (em breve)..." disabled className="w-full bg-gray-100 border-gray-200 rounded-lg py-3 pl-4 pr-12 text-gray-500 cursor-not-allowed" />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 cursor-not-allowed"><Send className="w-5 h-5" /></button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center text-gray-500">
            <div>
              <MessageSquareIcon className="w-16 h-16 mx-auto text-gray-300" />
              <p className="mt-4">Selecione uma conversa para ver as mensagens.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}