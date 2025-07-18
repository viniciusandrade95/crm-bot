// ==================================================================
// Ficheiro: src/components/SettingsView.js
// Responsabilidade: Permitir ao utilizador configurar os dados
// gerais, horários e a integração do bot.
// ==================================================================
import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, AlertCircle, Loader2, Building, Clock, Bot, MessageSquare } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { supabase } from '../supabaseClient';
import { Loader } from './ui/Feedback';
import { BusinessHours } from './BusinessHours';

// Novo componente para a aba de configuração do Bot
function BotSettings({ tenant, showNotification }) {
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Busca o número mapeado quando o componente é montado
  const fetchMapping = useCallback(async () => {
    if (!tenant?.id) return;
    const { data } = await supabase
      .from('phone_number_mappings')
      .select('whatsapp_phone_number')
      .eq('tenant_id', tenant.id)
      .single();
    if (data) {
      setWhatsappNumber(data.whatsapp_phone_number);
    }
  }, [tenant?.id]);

  useEffect(() => {
    fetchMapping();
  }, [fetchMapping]);

  const handleSaveBotSettings = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Upsert: cria uma nova entrada se não existir, ou atualiza a existente.
    // Usamos o tenant_id como o identificador único para a operação.
    const { error } = await supabase
      .from('phone_number_mappings')
      .upsert({ 
        tenant_id: tenant.id, 
        whatsapp_phone_number: whatsappNumber 
      }, { onConflict: 'tenant_id' });

    if (error) {
      showNotification(`Erro ao guardar número do bot: ${error.message}`, 'error');
    } else {
      showNotification('Configurações do bot guardadas com sucesso!', 'success');
    }
    setIsSaving(false);
  };

  return (
    <div className="bg-card rounded-lg shadow-sm p-6 lg:p-8">
      <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center">
        <Bot className="w-5 h-5 mr-2" />
        Configurações do Assistente
      </h3>
      <p className="text-muted-foreground mb-6">Ligue o seu número de WhatsApp a esta conta para ativar o bot.</p>
      <form onSubmit={handleSaveBotSettings} className="space-y-6">
        <div>
          <label htmlFor="whatsapp_phone_number" className="block text-sm font-medium text-foreground mb-2">
            Número de Telefone do WhatsApp (Bot)
          </label>
          <input 
            id="whatsapp_phone_number"
            name="whatsapp_phone_number"
            type="text"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-ring"
            placeholder="Ex: 15551234567 (sem '+')"
          />
          <p className="text-sm text-muted-foreground mt-1">Este é o número que o bot usará para receber e enviar mensagens.</p>
        </div>
        <div className="pt-4">
          <button type="submit" disabled={isSaving} className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold hover:bg-primary/90 transition flex items-center disabled:opacity-50">
            {isSaving && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
            {isSaving ? 'A guardar...' : 'Guardar Configurações do Bot'}
          </button>
        </div>
      </form>
    </div>
  );
}

export function SettingsView() {
  const { tenant, refreshTenant, loading: contextLoading } = useData();
  const [activeTab, setActiveTab] = useState('business');
  
  const [formData, setFormData] = useState({
    business_name: '',
    business_phone: '',
    business_address: '',
    working_hours: '',
    bot_personality: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const showNotification = useCallback((message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
  }, []);

  useEffect(() => {
    if (tenant) {
      setFormData({
        business_name: tenant.business_name || '',
        business_phone: tenant.business_phone || '',
        business_address: tenant.business_address || '',
        working_hours: tenant.working_hours || '',
        bot_personality: tenant.bot_personality || '',
      });
    }
  }, [tenant]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    const { error } = await supabase.from('tenants').update(formData).eq('id', tenant.id);
    
    if (error) {
      showNotification(`Erro ao guardar: ${error.message}`, 'error');
    } else {
      await refreshTenant();
      showNotification('Alterações guardadas com sucesso!', 'success');
    }
    setIsSaving(false);
  };
  
  if (contextLoading) return <Loader text="A carregar configurações..." />;
  
  if (!tenant) {
    return (
      <div className="text-center p-8 bg-card rounded-md shadow-sm">
        Não foi possível carregar os dados do negócio. Tente fazer login novamente.
      </div>
    );
  }

  const tabs = [
    { id: 'business', label: 'Informações Gerais', icon: Building },
    { id: 'hours', label: 'Horários', icon: Clock },
    { id: 'bot', label: 'Integração do Bot', icon: MessageSquare }, // Nova aba
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Configurações</h2>
        <p className="text-muted-foreground mt-1">Gira as informações do seu negócio e do assistente.</p>
      </div>

      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === tab.id ? 'border-sky-500 text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {notification.show && (
        <div className={`p-4 rounded-md flex items-center ${notification.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-destructive/10 text-destructive'}`}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5 mr-3" /> : <AlertCircle className="w-5 h-5 mr-3" />}
          {notification.message}
        </div>
      )}

      {activeTab === 'business' && (
        <div className="bg-card rounded-lg shadow-sm p-6 lg:p-8">
          <h3 className="text-xl font-semibold text-foreground mb-6">Informações do Negócio</h3>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="business_name" className="block text-sm font-medium text-foreground mb-2">Nome do Negócio</label>
                <input id="business_name" name="business_name" type="text" value={formData.business_name} onChange={handleInputChange} className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label htmlFor="business_phone" className="block text-sm font-medium text-foreground mb-2">Telefone de Contacto (WhatsApp)</label>
                <input id="business_phone" name="business_phone" type="text" value={formData.business_phone} onChange={handleInputChange} className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-ring" />
              </div>
            </div>
            <div>
              <label htmlFor="business_address" className="block text-sm font-medium text-foreground mb-2">Endereço</label>
              <input id="business_address" name="business_address" type="text" value={formData.business_address} onChange={handleInputChange} className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label htmlFor="working_hours" className="block text-sm font-medium text-foreground mb-2">Horário de Funcionamento (Resumo)</label>
              <input id="working_hours" name="working_hours" type="text" placeholder="Ex: Segunda a Sexta, 9h às 18h" value={formData.working_hours} onChange={handleInputChange} className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label htmlFor="bot_personality" className="block text-sm font-medium text-foreground mb-2">
                <Bot className="w-4 h-4 inline-block mr-2" />
                Personalidade do Bot
              </label>
              <textarea 
                id="bot_personality" name="bot_personality" rows="4"
                value={formData.bot_personality} onChange={handleInputChange} 
                className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-ring"
                placeholder="Descreva como o assistente deve se comportar..."
              />
            </div>
            <div className="pt-4">
              <button type="submit" disabled={isSaving} className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold hover:bg-primary/90 transition flex items-center disabled:opacity-50">
                {isSaving && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                {isSaving ? 'A guardar...' : 'Guardar Alterações'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'hours' && <BusinessHours />}
      
      {activeTab === 'bot' && <BotSettings tenant={tenant} showNotification={showNotification} />}
    </div>
  );
}
