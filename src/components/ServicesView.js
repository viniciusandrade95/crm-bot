// ==================================================================
// Ficheiro: src/components/ServicesView.js
// ==================================================================
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit } from 'lucide-react';
import { ServiceModal } from './ServiceModal';
import { useData } from '../contexts/DataContext';
import { supabase } from '../supabaseClient';
import { Loader } from './ui/Feedback';

export function ServicesView() {
  const { tenant, refreshTenant, loading: contextLoading } = useData();
  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  useEffect(() => {
    if (tenant?.services) {
      setServices(tenant.services);
    }
  }, [tenant]);

  const openModal = (service = null) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleSave = async () => {
    await refreshTenant();
    closeModal();
  };

  const handleDelete = async (serviceId) => {
    if (window.confirm("Tem a certeza que quer apagar este serviço?")) {
      await supabase.from('services').delete().eq('id', serviceId);
      await refreshTenant();
    }
  };

  if (contextLoading) return <Loader text="A carregar serviços..." />;
  if (!tenant) return <div className="text-center p-8 bg-white rounded-lg shadow-sm">Crie as configurações do seu negócio primeiro.</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Serviços</h2>
          <p className="text-gray-600 mt-1">Adicione e gira os serviços que o seu negócio oferece.</p>
        </div>
        <button onClick={() => openModal()} className="bg-sky-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-sky-700 transition flex items-center w-full sm:w-auto justify-center">
          <Plus className="w-5 h-5 mr-2" />
          Adicionar Serviço
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serviço</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duração</th>
                <th className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {services.map((service) => (
                <tr key={service.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{service.service_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.duration}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                    <button onClick={() => openModal(service)} className="text-sky-600 hover:text-sky-900"><Edit className="w-5 h-5" /></button>
                    <button onClick={() => handleDelete(service.id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-5 h-5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {services.length === 0 && <p className="text-center text-gray-500 py-8">Nenhum serviço adicionado.</p>}
      </div>
      {isModalOpen && <ServiceModal service={editingService} onClose={closeModal} onSave={handleSave} tenantId={tenant.id} />}
    </div>
  );
}