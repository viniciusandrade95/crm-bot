// ==================================================================
// Ficheiro: src/components/SettingsView.js - Com navegação por tab
// ==================================================================
import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Loader2, Building, Clock } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { supabase } from '../supabaseClient';
import { Loader } from './ui/Feedback';
import { BusinessHours } from './BusinessHours';

export function SettingsView({ defaultTab = 'business' }) {
  const { tenant, refreshTenant, loading: contextLoading } = useData();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    if (tenant) {
      setFormData({
        business_name: tenant.business_name || '',
        working_hours: tenant.working_hours || '',
        address: tenant.address || '',
        business_phone: tenant.business_phone || ''
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
    setNotification({ show: false, message: '' });

    const { error } = await supabase.from('tenants').update(formData).eq('id', tenant.id);
    
    if (error) {
      setNotification({ show: true, message: `Erro ao guardar: ${error.message}`, type: 'error' });
    } else {
      await refreshTenant();
      setNotification({ show: true, message: 'Alterações guardadas com sucesso!', type: 'success' });
    }
    setIsSaving(false);
  };
  
  if (contextLoading) return <Loader text="A carregar configurações..." />;
  if (!tenant) return <div className="text-center p-8 bg-white rounded-lg shadow-sm">Crie as configurações do seu negócio primeiro.</div>;

  const tabs = [
    { id: 'business', label: 'Informações Gerais', icon: Building },
    { id: 'hours', label: 'Horários', icon: Clock }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>
        <p className="text-gray-600 mt-1">Gira as informações do seu negócio e do assistente.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm flex items-center
                ${activeTab === tab.id 
                  ? 'border-sky-500 text-sky-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {notification.show && (
        <div className={`p-4 rounded-lg flex items-center ${notification.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5 mr-3" /> : <AlertCircle className="w-5 h-5 mr-3" />}
          {notification.message}
        </div>
      )}

      {/* Conteúdo das Tabs */}
      {activeTab === 'business' ? (
        <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Informações do Negócio</h3>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="business_name" className="block text-sm font-medium text-gray-700 mb-2">Nome do Negócio</label>
                <input id="business_name" name="business_name" type="text" value={formData.business_name || ''} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" />
              </div>
              <div>
                <label htmlFor="business_phone" className="block text-sm font-medium text-gray-700 mb-2">Telefone de Contacto (WhatsApp)</label>
                <input id="business_phone" name="business_phone" type="text" value={formData.business_phone || ''} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" />
              </div>
            </div>
            <div>
              <label htmlFor="working_hours" className="block text-sm font-medium text-gray-700 mb-2">Horário de Funcionamento (Resumo)</label>
              <input id="working_hours" name="working_hours" type="text" placeholder="Ex: Segunda a Sexta, 9h às 18h" value={formData.working_hours || ''} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" />
              <p className="text-sm text-gray-500 mt-1">Para horários detalhados, use a aba "Horários"</p>
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
              <input id="address" name="address" type="text" value={formData.address || ''} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" />
            </div>
            <div className="pt-4">
              <button type="submit" disabled={isSaving} className="bg-sky-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-sky-700 transition flex items-center disabled:opacity-50">
                {isSaving && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                {isSaving ? 'A guardar...' : 'Guardar Alterações'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <BusinessHours />
      )}
    </div>
  );
}