// ==================================================================
// Ficheiro: src/components/CustomerModal.js - Versão Melhorada
// ==================================================================
import React, { useState } from 'react';
import { Loader2, Star, Tag, Calendar, MessageSquare } from 'lucide-react';
import { supabase } from '../supabaseClient';

export function CustomerModal({ customer, onClose, onSave, tenantId }) {
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    phone_number: customer?.phone_number || '',
    email: customer?.email || '',
    notes: customer?.notes || '',
    is_vip: customer?.is_vip || false,
    preferred_services: customer?.preferred_services || '',
    tags: customer?.tags || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    const dataToSave = {
      ...formData,
      // Converter tags string em array JSON
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
    };
    
    if (customer) { // Editar
      await supabase.from('customers').update(dataToSave).eq('id', customer.id);
    } else { // Criar
      await supabase.from('customers').insert({ ...dataToSave, tenant_id: tenantId });
    }
    
    setIsSaving(false);
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {customer ? 'Editar Cliente' : 'Adicionar Novo Cliente'}
        </h2>
        
        <form onSubmit={handleSave} className="space-y-6">
          {/* Informações Básicas */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              Informações Básicas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" 
                  placeholder="Nome do cliente"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefone*</label>
                <input 
                  type="text" 
                  required 
                  value={formData.phone_number} 
                  onChange={(e) => setFormData({...formData, phone_number: e.target.value})} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" 
                  placeholder="+351 999 999 999"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input 
                type="email" 
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" 
                placeholder="cliente@email.com"
              />
            </div>
          </div>

          {/* Preferências */}
          <div className="bg-sky-50 p-4 rounded-lg space-y-4">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <Star className="w-4 h-4 mr-2" />
              Preferências e Status
            </h3>
            
            <div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.is_vip} 
                  onChange={(e) => setFormData({...formData, is_vip: e.target.checked})}
                  className="w-5 h-5 text-sky-600 rounded focus:ring-sky-500"
                />
                <span className="text-gray-700 font-medium">Cliente VIP</span>
                <Star className="w-4 h-4 text-yellow-500" />
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Serviços Preferidos</label>
              <input 
                type="text" 
                value={formData.preferred_services} 
                onChange={(e) => setFormData({...formData, preferred_services: e.target.value})} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" 
                placeholder="Ex: Corte masculino, Barba"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Tags (separadas por vírgula)
              </label>
              <input 
                type="text" 
                value={formData.tags} 
                onChange={(e) => setFormData({...formData, tags: e.target.value})} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" 
                placeholder="Ex: Pontual, Prefere manhãs, Alérgico a X"
              />
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notas Internas</label>
            <textarea 
              value={formData.notes} 
              onChange={(e) => setFormData({...formData, notes: e.target.value})} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" 
              rows="4"
              placeholder="Observações sobre o cliente..."
            />
          </div>

          {/* Estatísticas (só aparece se estiver a editar) */}
          {customer && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Estatísticas
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Cliente desde:</span>
                  <p className="font-medium">{new Date(customer.created_at).toLocaleDateString('pt-PT')}</p>
                </div>
                <div>
                  <span className="text-gray-600">Última atualização:</span>
                  <p className="font-medium">{new Date(customer.updated_at).toLocaleDateString('pt-PT')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="pt-6 flex justify-end space-x-4 border-t">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isSaving} 
              className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 flex items-center transition"
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