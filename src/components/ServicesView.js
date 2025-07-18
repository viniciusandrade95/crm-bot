// ==================================================================
// Ficheiro: src/components/ServicesView.js (Refatorado)
// Responsabilidade: Apenas renderizar a lista de serviços e
// gerir a abertura/fecho do modal.
// ==================================================================
import React, { useState } from 'react';
import { Plus, Trash2, Edit, AlertCircle } from 'lucide-react';
import { ServiceModal } from './ServiceModal';
import { useServices } from '../hooks/useServices'; // Importa o novo hook
import { Loader } from './ui/Feedback';
import { useData } from '../contexts/DataContext';

export function ServicesView() {
  // O estado agora vem do hook e do contexto de dados principal
  const { tenant, loading: contextLoading } = useData();
  const { services, isLoading, error, addService, updateService, deleteService } = useServices();

  // Estado local apenas para controlar a UI (modal)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const handleOpenModal = (service = null) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  // Função que será passada para o modal.
  // Ela decide se deve chamar a função de adicionar ou de atualizar do hook.
  const handleSave = async (serviceData) => {
    if (editingService) {
      await updateService(editingService.id, serviceData);
    } else {
      await addService(serviceData);
    }
  };

  const handleDelete = (serviceId) => {
    // A confirmação deve ser feita com um modal de confirmação, não com window.confirm.
    // Por agora, chamamos diretamente a função de apagar.
    if (window.confirm("Tem a certeza que quer apagar este serviço?")) {
        deleteService(serviceId);
    }
  };

  // Renderiza o estado de carregamento principal
  if (contextLoading) return <Loader text="A carregar dados do negócio..." />;

  // Adiciona uma verificação para garantir que o tenant existe antes de prosseguir
  if (!tenant) {
    return (
      <div className="text-center p-8 bg-card rounded-md shadow-sm">
        <p>Não foi possível carregar os dados do negócio.</p>
        <p>Por favor, configure as informações do seu negócio primeiro.</p>
      </div>
    );
  }
  
  // Renderiza o estado de carregamento dos serviços
  if (isLoading) return <Loader text="A carregar serviços..." />;

  // Renderiza o estado de erro
  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-md flex items-center">
        <AlertCircle className="w-5 h-5 mr-3" />
        <p>Ocorreu um erro ao carregar os serviços: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Serviços</h2>
          <p className="text-muted-foreground mt-1">Adicione e gira os serviços que o seu negócio oferece.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-semibold hover:bg-primary/90 transition flex items-center w-full sm:w-auto justify-center">
          <Plus className="w-5 h-5 mr-2" />
          Adicionar Serviço
        </button>
      </div>
      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Serviço</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Preço</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Duração</th>
                <th className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-gray-200">
              {services.map((service) => (
                <tr key={service.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{service.service_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{service.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{service.duration}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                    <button onClick={() => handleOpenModal(service)} className="text-primary hover:text-sky-900"><Edit className="w-5 h-5" /></button>
                    <button onClick={() => handleDelete(service.id)} className="text-destructive hover:text-destructive/90"><Trash2 className="w-5 h-5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {services.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum serviço adicionado.</p>}
      </div>
      {isModalOpen && (
        <ServiceModal 
          service={editingService} 
          onClose={handleCloseModal} 
          onSave={handleSave}
          tenantId={tenant.id}
        />
      )}
    </div>
  );
}
