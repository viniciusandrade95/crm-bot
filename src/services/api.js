// ==================================================================
// Ficheiro: src/services/api.js
// Responsabilidade: Isolar toda a lógica de acesso a dados.
// ==================================================================
import { supabase } from '../supabaseClient';

/**
 * Trata os erros do Supabase de forma consistente.
 * @param {Error} error - O objeto de erro do Supabase.
 * @param {string} context - A descrição da operação que falhou.
 */
const handleError = (error, context) => {
  console.error(context, error);
  throw new Error(`Erro em "${context}": ${error.message}`);
};

// --- Funções de Serviços ---

export const getServices = async (tenantId) => {
  if (!tenantId) return [];
  const { data, error } = await supabase.from('services').select('*').eq('tenant_id', tenantId).order('service_name');
  if (error) handleError(error, 'buscar serviços');
  return data || [];
};

export const addService = async (serviceData) => {
  const { data, error } = await supabase.from('services').insert([serviceData]).select().single();
  if (error) handleError(error, 'adicionar serviço');
  return data;
};

export const updateService = async (serviceId, updates) => {
  const { data, error } = await supabase.from('services').update(updates).eq('id', serviceId).select().single();
  if (error) handleError(error, 'atualizar serviço');
  return data;
};

export const deleteService = async (serviceId) => {
  const { error } = await supabase.from('services').delete().eq('id', serviceId);
  if (error) handleError(error, 'remover serviço');
};

// --- Funções de Clientes (Atualizadas) ---

export const getCustomers = async (tenantId) => {
  if (!tenantId) return [];
  const { data, error } = await supabase.from('customers').select('*').eq('tenant_id', tenantId).order('name');
  if (error) handleError(error, 'buscar clientes');
  return data || [];
};

export const addCustomer = async (customerData) => {
  const { data, error } = await supabase.from('customers').insert([customerData]).select().single();
  if (error) handleError(error, 'adicionar cliente');
  return data;
};

export const updateCustomer = async (customerId, updates) => {
  const { data, error } = await supabase.from('customers').update(updates).eq('id', customerId).select().single();
  if (error) handleError(error, 'atualizar cliente');
  return data;
};

export const deleteCustomer = async (customerId) => {
  const { error } = await supabase.from('customers').delete().eq('id', customerId);
  if (error) handleError(error, 'remover cliente');
};


// --- Funções de Agendamentos ---

export const getAppointments = async (tenantId, startDate, endDate) => {
  if (!tenantId) return [];
  const { data, error } = await supabase
    .from('appointments')
    .select('*, customers(id, name), services(id, service_name)')
    .eq('tenant_id', tenantId)
    .gte('appointment_date', startDate)
    .lte('appointment_date', endDate)
    .order('appointment_date');
    
  if (error) handleError(error, 'buscar agendamentos');
  return data || [];
};

export const addAppointment = async (appointmentData) => {
  const { data, error } = await supabase.from('appointments').insert([appointmentData]).select().single();
  if (error) handleError(error, 'adicionar agendamento');
  return data;
};

export const updateAppointment = async (appointmentId, updates) => {
  const { data, error } = await supabase.from('appointments').update(updates).eq('id', appointmentId).select().single();
  if (error) handleError(error, 'atualizar agendamento');
  return data;
};

export const deleteAppointment = async (appointmentId) => {
  const { error } = await supabase.from('appointments').delete().eq('id', appointmentId);
  if (error) handleError(error, 'remover agendamento');
};
