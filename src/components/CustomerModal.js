// ==================================================================
// Ficheiro: src/components/CustomerModal.js (Corrigido)
// Responsabilidade: Renderizar o formulário e chamar as funções
// corretas de adicionar/atualizar recebidas via props.
// ==================================================================
import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

export function CustomerModal({ customer, onClose, addCustomer, updateCustomer }) {
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    email: '',
    notes: '',
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        phone_number: customer.phone_number || '',
        email: customer.email || '',
        notes: customer.notes || '',
      });
    } else {
      setFormData({ name: '', phone_number: '', email: '', notes: '' });
    }
  }, [customer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (error) setError(null);
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      if (customer) {
        if (typeof updateCustomer !== 'function') {
          throw new Error("Erro interno: A função 'updateCustomer' não foi fornecida ao modal.");
        }
        await updateCustomer(customer.id, formData);
      } else {
        if (typeof addCustomer !== 'function') {
          throw new Error("Erro interno: A função 'addCustomer' não foi fornecida ao modal.");
        }
        await addCustomer(formData);
      }
      onClose();
    } catch (err) {
      console.error("Falha ao guardar cliente:", err);
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-2xl p-8 w-full max-w-lg">
        <h2 className="text-xl font-bold text-foreground mb-6">
          {customer ? 'Editar Cliente' : 'Adicionar Novo Cliente'}
        </h2>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Nome</label>
            <input name="name" type="text" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-border rounded-md" placeholder="Nome do cliente" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Telefone*</label>
            <input name="phone_number" type="text" required value={formData.phone_number} onChange={handleChange} className="w-full px-4 py-2 border border-border rounded-md" placeholder="+351 999 999 999" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
            <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-border rounded-md" placeholder="cliente@email.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Notas</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" className="w-full px-4 py-2 border border-border rounded-md"></textarea>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-center text-sm">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-6 flex justify-end space-x-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition">Cancelar</button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center transition">
              {isSaving && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
              {isSaving ? 'A guardar...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
