import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Bot, CheckCircle, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: 'error' });
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSignUp = async () => {
    // 1. Tenta criar o utilizador no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      throw new Error(authError.message);
    }
    if (!authData.user) {
      throw new Error('Registo falhou, por favor tente novamente.');
    }

    // 2. Cria um novo "tenant" (negócio) para este utilizador
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .insert([{ business_name: 'Meu Novo Negócio' }])
      .select()
      .single();

    if (tenantError) {
      // Idealmente, aqui deveria haver uma lógica para apagar o utilizador recém-criado
      // para evitar utilizadores órfãos. Por agora, apenas mostramos o erro.
      throw new Error(`Erro ao criar o negócio: ${tenantError.message}`);
    }

    // 3. Cria o perfil público do utilizador, associando-o ao tenant
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{ id: authData.user.id, tenant_id: tenantData.id }]);
    
    if (profileError) {
      throw new Error(`Erro ao criar o perfil: ${profileError.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: 'error' });

    try {
      if (isSignUp) {
        await handleSignUp();
        setMessage({ text: 'Verifique o seu email para confirmar o registo!', type: 'success' });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-100 rounded-full mb-4">
              <Bot className="w-8 h-8 text-sky-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">WhatsApp CRM</h1>
            <p className="text-gray-600 mt-2">{isSignUp ? 'Crie a sua conta para começar' : 'Bem-vindo de volta!'}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition" placeholder="seu@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition" placeholder="••••••••" />
            </div>
            {message.text && (
              <div className={`p-3 rounded-lg text-sm flex items-center ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {message.type === 'error' ? <AlertCircle className="w-4 h-4 mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                {message.text}
              </div>
            )}
            <button type="submit" disabled={loading} className="w-full bg-sky-600 text-white py-3 rounded-lg font-medium hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition">
              {loading ? 'A processar...' : (isSignUp ? 'Criar Conta' : 'Entrar')}
            </button>
          </form>
          <div className="mt-6 text-center">
            <button onClick={() => { setIsSignUp(!isSignUp); setMessage({ text: '', type: 'error' }); }} className="text-sky-600 hover:text-sky-700 text-sm font-medium">
              {isSignUp ? 'Já tem uma conta? Entre' : 'Não tem conta? Cadastre-se'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
