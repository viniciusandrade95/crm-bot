// ==================================================================
// Ficheiro: src/services/api.js
// Responsabilidade: Isolar toda a lógica de acesso a dados para a
// funcionalidade de "Serviços".
// ==================================================================
import { supabase } from '../supabaseClient';

/**
 * Trata os erros do Supabase de forma consistente.
 * @param {Error} error - O objeto de erro do Supabase.
 * @param {string} context - A descrição da operação que falhou.
 */
const handleError = (error, context) => {
  console.error(context, error);
  // Lança um novo erro mais descritivo para ser capturado pela camada de estado (hook).
  throw new Error(`Erro em "${context}": ${error.message}`);
};

/**
 * Busca a lista de serviços de um determinado tenant.
 * @param {string} tenantId - O ID do tenant.
 * @returns {Promise<Array>} A lista de serviços.
 */
export const getServices = async (tenantId) => {
  if (!tenantId) {
    // Retorna um array vazio se não houver tenantId, evitando erros.
    return [];
  }

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('service_name', { ascending: true });

  if (error) {
    handleError(error, 'buscar serviços');
  }

  return data || [];
};

/**
 * Adiciona um novo serviço ao banco de dados.
 * @param {Object} serviceData - Os dados do serviço a ser adicionado.
 * @returns {Promise<Object>} O serviço recém-criado.
 */
export const addService = async (serviceData) => {
  const { data, error } = await supabase
    .from('services')
    .insert([serviceData])
    .select()
    .single(); // .select().single() retorna o objeto inserido

  if (error) {
    handleError(error, 'adicionar serviço');
  }

  return data;
};

/**
 * Atualiza um serviço existente.
 * @param {string} serviceId - O ID do serviço a ser atualizado.
 * @param {Object} updates - Os campos a serem atualizados.
 * @returns {Promise<Object>} O serviço atualizado.
 */
export const updateService = async (serviceId, updates) => {
  const { data, error } = await supabase
    .from('services')
    .update(updates)
    .eq('id', serviceId)
    .select()
    .single();

  if (error) {
    handleError(error, 'atualizar serviço');
  }

  return data;
};

/**
 * Remove um serviço do banco de dados.
 * @param {string} serviceId - O ID do serviço a ser removido.
 */
export const deleteService = async (serviceId) => {
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', serviceId);

  if (error) {
    handleError(error, 'remover serviço');
  }
};
