// ==================================================================
// Ficheiro: src/components/CustomersView.js (Corrigido)
// Responsabilidade: Renderizar a lista de clientes e passar as
// funções corretas para o modal.
// ==================================================================
import React, { useState } from 'react';
import { Plus, Trash2, Edit, AlertCircle } from 'lucide-react';
import { CustomerModal } from './CustomerModal';
import { useCustomers } from '../hooks/useCustomers';
import { Loader } from './ui/Feedback';

export function CustomersView() {
  const { customers, isLoading, error, addCustomer, updateCustomer, deleteCustomer } = useCustomers();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const handleOpenModal = (customer = null) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  const handleDelete = (customerId) => {
    if (window.confirm("Tem a certeza que quer apagar este cliente?")) {
      deleteCustomer(customerId).catch(err => {
        // Adiciona tratamento de erro para a exclusão, se necessário
        console.error("Erro ao apagar cliente:", err);
      });
    }
  };

  if (isLoading) return <Loader text="A carregar clientes..." />;

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center">
        <AlertCircle className="w-5 h-5 mr-3" />
        <p>Ocorreu um erro ao carregar os clientes: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clientes</h2>
          <p className="text-gray-600 mt-1">Gira a sua lista de clientes.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-sky-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-sky-700 transition flex items-center w-full sm:w-auto justify-center">
          <Plus className="w-5 h-5 mr-2" />
          Adicionar Cliente
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.name || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.phone_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                    <button onClick={() => handleOpenModal(customer)} className="text-sky-600 hover:text-sky-900"><Edit className="w-5 h-5" /></button>
                    <button onClick={() => handleDelete(customer.id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-5 h-5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {customers.length === 0 && <p className="text-center text-gray-500 py-8">Nenhum cliente adicionado.</p>}
      </div>
      {/* Passa as funções 'addCustomer' e 'updateCustomer' diretamente para o modal */}
      {isModalOpen && (
        <CustomerModal 
          customer={editingCustomer} 
          onClose={handleCloseModal} 
          addCustomer={addCustomer}
          updateCustomer={updateCustomer}
        />
      )}
    </div>
  );
}
