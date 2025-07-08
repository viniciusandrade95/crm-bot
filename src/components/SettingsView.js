import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useData, useAsyncOperation } from '../contexts/DataContext';
import { safeSupabase } from '../supabaseClient';
import { Loader } from './ui/Feedback';

// Form validation helper
const validateSettingsForm = (formData) => {
  const errors = {};
  
  if (!formData.business_name?.trim()) {
    errors.business_name = 'Nome do negócio é obrigatório';
  } else if (formData.business_name.length < 2) {
    errors.business_name = 'Nome deve ter pelo menos 2 caracteres';
  }
  
  if (formData.business_phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.business_phone)) {
    errors.business_phone = 'Formato de telefone inválido';
  }
  
  if (formData.working_hours && formData.working_hours.length > 100) {
    errors.working_hours = 'Horário muito longo (máximo 100 caracteres)';
  }
  
  if (formData.address && formData.address.length > 200) {
    errors.address = 'Endereço muito longo (máximo 200 caracteres)';
  }
  
  return errors;
};

export function SettingsView() {
  const { tenant, refreshTenant, loading: contextLoading } = useData();
  const [formData, setFormData] = useState({
    business_name: '',
    working_hours: '',
    address: '',
    business_phone: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  
  const { loading: isSaving, error: saveError, execute, clearError } = useAsyncOperation();

  // Initialize form data when tenant changes
  useEffect(() => {
    if (tenant) {
      const newFormData = {
        business_name: tenant.business_name || '',
        working_hours: tenant.working_hours || '',
        address: tenant.address || '',
        business_phone: tenant.business_phone || ''
      };
      setFormData(newFormData);
      setHasChanges(false);
    }
  }, [tenant]);

  // Handle input changes
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Check if there are changes
      if (tenant) {
        const hasChanges = Object.keys(newData).some(key => 
          newData[key] !== (tenant[key] || '')
        );
        setHasChanges(hasChanges);
      }
      
      return newData;
    });
    
    // Clear specific field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear save error when user makes changes
    if (saveError) {
      clearError();
    }
  }, [tenant, formErrors, saveError, clearError]);

  // Handle form submission
  const handleSave = useCallback(async (e) => {
    e.preventDefault();
    
    // Clear previous notifications
    setNotification({ show: false, message: '', type: 'success' });
    clearError();
    
    // Validate form
    const errors = validateSettingsForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      await execute(async () => {
        const { error } = await safeSupabase
          .from('tenants')
          .update(formData)
          .eq('id', tenant.id);
        
        if (error) throw error;
        
        // Refresh tenant data
        await refreshTenant();
        
        // Show success notification
        setNotification({
          show: true,
          message: 'Configurações salvas com sucesso!',
          type: 'success'
        });
        
        setHasChanges(false);
        setFormErrors({});
        
        // Auto-hide notification after 3 seconds
        setTimeout(() => {
          setNotification({ show: false, message: '', type: 'success' });
        }, 3000);
      });
    } catch (err) {
      setNotification({
        show: true,
        message: `Erro ao salvar: ${err.message}`,
        type: 'error'
      });
      
      // Auto-hide error notification after 5 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '', type: 'success' });
      }, 5000);
    }
  }, [formData, tenant, execute, clearError, refreshTenant]);

  // Handle form reset
  const handleReset = useCallback(() => {
    if (tenant) {
      setFormData({
        business_name: tenant.business_name || '',
        working_hours: tenant.working_hours || '',
        address: tenant.address || '',
        business_phone: tenant.business_phone || ''
      });
      setHasChanges(false);
      setFormErrors({});
      clearError();
    }
  }, [tenant, clearError]);

  // Loading state
  if (contextLoading) {
    return <Loader text="A carregar configurações..." />;
  }

  // No tenant state
  if (!tenant) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow-sm">
        <p className="text-gray-600">
          Configure o seu negócio para começar a usar o sistema.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>
        <p className="text-gray-600 mt-1">
          Gira as informações do seu negócio e do assistente.
        </p>
      </div>

      {/* Notifications */}
      {notification.show && (
        <div className={`p-4 rounded-lg flex items-center ${
          notification.type === 'success' 
            ? 'bg-green-50 text-green-700' 
            : 'bg-red-50 text-red-700'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 mr-3" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-3" />
          )}
          {notification.message}
        </div>
      )}

      {/* Save Error */}
      {saveError && (
        <div className="p-4 rounded-lg flex items-center bg-red-50 text-red-700">
          <AlertCircle className="w-5 h-5 mr-3" />
          Erro ao salvar: {saveError.message}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          Informações do Negócio
        </h3>
        
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="business_name" className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Negócio *
              </label>
              <input
                id="business_name"
                name="business_name"
                type="text"
                required
                value={formData.business_name}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition ${
                  formErrors.business_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nome do seu negócio"
                disabled={isSaving}
              />
              {formErrors.business_name && (
                <p className="mt-1 text-sm text-red-600">{formErrors.business_name}</p>
              )}
            </div>

            <div>
              <label htmlFor="business_phone" className="block text-sm font-medium text-gray-700 mb-2">
                Telefone de Contacto (WhatsApp)
              </label>
              <input
                id="business_phone"
                name="business_phone"
                type="tel"
                value={formData.business_phone}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition ${
                  formErrors.business_phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+351 xxx xxx xxx"
                disabled={isSaving}
              />
              {formErrors.business_phone && (
                <p className="mt-1 text-sm text-red-600">{formErrors.business_phone}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="working_hours" className="block text-sm font-medium text-gray-700 mb-2">
              Horário de Funcionamento
            </label>
            <input
              id="working_hours"
              name="working_hours"
              type="text"
              value={formData.working_hours}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition ${
                formErrors.working_hours ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: Segunda a Sexta, 9h às 18h"
              disabled={isSaving}
            />
            {formErrors.working_hours && (
              <p className="mt-1 text-sm text-red-600">{formErrors.working_hours}</p>
            )}
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Endereço
            </label>
            <textarea
              id="address"
              name="address"
              rows={3}
              value={formData.address}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition ${
                formErrors.address ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Endereço completo do seu negócio"
              disabled={isSaving}
            />
            {formErrors.address && (
              <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>
            )}
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={isSaving || !hasChanges}
              className="bg-sky-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-sky-700 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
              {isSaving ? 'A guardar...' : 'Guardar Alterações'}
            </button>
            
            {hasChanges && (
              <button
                type="button"
                onClick={handleReset}
                disabled={isSaving}
                className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}