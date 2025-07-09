// ==================================================================
// Ficheiro: src/components/ServiceModal.js (Refatorado)
// Responsabilidade: Apenas renderizar o formulário e invocar
// a função onSave recebida por props. Não tem conhecimento da API.
// ==================================================================
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export function ServiceModal({ service, onClose, onSave, tenantId }) {
  // Estado local para gerir os dados do formulário.
  const [formData, setFormData] = useState({
    service_name: '',
    price: '',
    duration: ''
  });
  
  // Estado local para controlar o loading do botão de salvar.
  const [isSaving, setIsSaving] = useState(false);

  // Popula o formulário quando o serviço a ser editado muda.
  useEffect(() => {
    if (service) {
      setFormData({
        service_name: service.service_name || '',
        price: service.price || '',
        duration: service.duration || ''
      });
    } else {
      // Limpa o formulário para adicionar um novo serviço
      setFormData({ service_name: '', price: '', duration: '' });
    }
  }, [service]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // A função onSave é passada pelo componente pai (ServicesView)
      // e já contém a lógica de `addService` ou `updateService`.
      await onSave(formData);
      onClose(); // Fecha o modal em caso de sucesso
    } catch (error) {
      // O erro já é tratado no hook, mas podemos adicionar feedback aqui se necessário.
      console.error("Falha ao guardar o serviço:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-6">{service ? 'Editar Serviço' : 'Adicionar Novo Serviço'}</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Serviço</label>
            <input type="text" required name="service_name" value={formData.service_name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preço</label>
            <input type="text" name="price" value={formData.price} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duração</label>
            <input type="text" name="duration" value={formData.duration} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
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
