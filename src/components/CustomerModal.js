// ==================================================================
// Ficheiro: src/components/CustomerModal.js
// ==================================================================
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

export function CustomerModal({ customer, onClose, onSave, tenantId }) {
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    phone_number: customer?.phone_number || '',
    email: customer?.email || '',
    notes: customer?.notes || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    if (customer) { // Editar
      await supabase.from('customers').update(formData).eq('id', customer.id);
    } else { // Criar
      await supabase.from('customers').insert({ ...formData, tenant_id: tenantId });
    }
    
    setIsSaving(false);
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-6">{customer ? 'Editar Cliente' : 'Adicionar Novo Cliente'}</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
            <input type="text" required value={formData.phone_number} onChange={(e) => setFormData({...formData, phone_number: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
            <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" rows="3"></textarea>
          </div>
          <div className="pt-6 flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancelar</button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 flex items-center">
              {isSaving && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
              {isSaving ? 'A guardar...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}