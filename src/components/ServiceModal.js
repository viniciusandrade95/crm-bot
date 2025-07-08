// ==================================================================
// Ficheiro: src/components/ServiceModal.js
// ==================================================================
import { Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

export function ServiceModal({ service, onClose, onSave, tenantId }) {
  const [formData, setFormData] = useState({
    service_name: service?.service_name || '',
    price: service?.price || '',
    duration: service?.duration || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    if (service) { // Editar
      await supabase.from('services').update(formData).eq('id', service.id);
    } else { // Criar
      await supabase.from('services').insert({ ...formData, tenant_id: tenantId });
    }
    
    setIsSaving(false);
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-6">{service ? 'Editar Serviço' : 'Adicionar Novo Serviço'}</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Serviço</label>
            <input type="text" required value={formData.service_name} onChange={(e) => setFormData({...formData, service_name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preço</label>
            <input type="text" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duração</label>
            <input type="text" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
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