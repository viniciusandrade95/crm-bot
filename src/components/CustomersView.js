// ==================================================================
// Ficheiro: src/components/CustomersView.js
// ==================================================================
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit } from 'lucide-react';
import { CustomerModal } from './CustomerModal';
import { useData } from '../contexts/DataContext';
import { supabase } from '../supabaseClient';
import { Loader } from './ui/Feedback';

export function CustomersView() {
  const { tenant, refreshTenant, loading: contextLoading } = useData();
  const [customers, setCustomers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  useEffect(() => {
    if (tenant?.customers) {
      setCustomers(tenant.customers);
    }
  }, [tenant]);

  const openModal = (customer = null) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  const handleSave = async () => {
    await refreshTenant();
    closeModal();
  };

  const handleDelete = async (customerId) => {
    if (window.confirm("Tem a certeza que quer apagar este cliente?")) {
      await supabase.from('customers').delete().eq('id', customerId);
      await refreshTenant();
    }
  };

  if (contextLoading) return <Loader text="A carregar clientes..." />;
  if (!tenant) return <div className="text-center p-8 bg-white rounded-lg shadow-sm">Crie as configurações do seu negócio primeiro.</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clientes</h2>
          <p className="text-gray-600 mt-1">Gira a sua lista de clientes.</p>
        </div>
        <button onClick={() => openModal()} className="bg-sky-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-sky-700 transition flex items-center w-full sm:w-auto justify-center">
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
                    <button onClick={() => openModal(customer)} className="text-sky-600 hover:text-sky-900"><Edit className="w-5 h-5" /></button>
                    <button onClick={() => handleDelete(customer.id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-5 h-5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {customers.length === 0 && <p className="text-center text-gray-500 py-8">Nenhum cliente adicionado.</p>}
      </div>
      {isModalOpen && <CustomerModal customer={editingCustomer} onClose={closeModal} onSave={handleSave} tenantId={tenant.id} />}
    </div>
  );
}