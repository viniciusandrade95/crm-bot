import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, X, AlertCircle } from 'lucide-react';
import { safeSupabase } from '../supabaseClient';
import { useAsyncOperation } from '../contexts/DataContext';

// Form validation helper
const validateServiceForm = (formData) => {
  const errors = {};
  
  if (!formData.service_name?.trim()) {
    errors.service_name = 'Nome do serviço é obrigatório';
  } else if (formData.service_name.length < 2) {
    errors.service_name = 'Nome deve ter pelo menos 2 caracteres';
  }
  
  if (formData.price && !/^\d+([.,]\d{2})?€?$/.test(formData.price.replace(/\s/g, ''))) {
    errors.price = 'Formato de preço inválido (ex: 25.00€)';
  }
  
  if (formData.duration && formData.duration.length > 50) {
    errors.duration = 'Duração muito longa (máximo 50 caracteres)';
  }
  
  return errors;
};

export function ServiceModal({ service, onClose, onSave, tenantId }) {
  const [formData, setFormData] = useState({
    service_name: '',
    price: '',
    duration: ''
  });
  const [formErrors, setFormErrors] = useState({});
  
  const { loading: isSaving, error: saveError, execute, clearError } = useAsyncOperation();

  // Initialize form data
  useEffect(() => {
    if (service) {
      setFormData({
        service_name: service.service_name || '',
        price: service.price || '',
        duration: service.duration || ''
      });
    } else {
      setFormData({
        service_name: '',
        price: '',
        duration: ''
      });
    }
    setFormErrors({});
    clearError();
  }, [service, clearError]);

  // Handle input changes
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear specific field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear save error when user makes changes
    if (saveError) {
      clearError();
    }
  }, [formErrors, saveError, clearError]);

  // Handle form submission
  const handleSave = useCallback(async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateServiceForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      await execute(async () => {
        const serviceData = {
          service_name: formData.service_name.trim(),
          price: formData.price.trim(),
          duration: formData.duration.trim()
        };
        
        if (service) {
          // Update existing service
          const { error } = await safeSupabase
            .from('services')
            .update(serviceData)
            .eq('id', service.id);
          
          if (error) throw error;
        } else {
          // Create new service
          const { error } = await safeSupabase
            .from('services')
            .insert({ ...serviceData, tenant_id: tenantId });
          
          if (error) throw error;
        }
        
        // Call parent callback
        onSave();
      });
    } catch (err) {
      // Error is handled by useAsyncOperation
      console.error('Service save error:', err);
    }
  }, [formData, service, tenantId, execute, onSave]);

  // Handle modal close
  const handleClose = useCallback(() => {
    if (!isSaving) {
      onClose();
    }
  }, [isSaving, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [handleClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {service ? 'Editar Serviço' : 'Adicionar Novo Serviço'}
          </h2>
          <button
            onClick={handleClose}
            disabled={isSaving}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Save Error */}
        {saveError && (
          <div className="mb-4 p-3 rounded-lg flex items-center bg-red-50 text-red-700">
            <AlertCircle className="w-4 h-4 mr-2" />
            Erro ao salvar: {saveError.message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label htmlFor="service_name" className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Serviço *
            </label>
            <input
              id="service_name"
              name="service_name"
              type="text"
              required
              value={formData.service_name}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition ${
                formErrors.service_name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: Corte de Cabelo"
              disabled={isSaving}
            />
            {formErrors.service_name && (
              <p className="mt-1 text-sm text-red-600">{formErrors.service_name}</p>
            )}
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
              Preço
            </label>
            <input
              id="price"
              name="price"
              type="text"
              value={formData.price}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition ${
                formErrors.price ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: 25.00€"
              disabled={isSaving}
            />
            {formErrors.price && (
              <p className="mt-1 text-sm text-red-600">{formErrors.price}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Formato sugerido: 25.00€
            </p>
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
              Duração
            </label>
            <input
              id="duration"
              name="duration"
              type="text"
              value={formData.duration}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition ${
                formErrors.duration ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: 30 minutos"
              disabled={isSaving}
            />
            {formErrors.duration && (
              <p className="mt-1 text-sm text-red-600">{formErrors.duration}</p>
            )}
          </div>

          {/* Actions */}
          <div className="pt-6 flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition disabled:opacity-50 flex items-center justify-center"
            >
              {isSaving && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
              {isSaving ? 'A guardar...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}