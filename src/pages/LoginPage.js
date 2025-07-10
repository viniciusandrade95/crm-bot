import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Bot, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: 'error' });
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSignUp = async () => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Registo falhou, por favor tente novamente.');
    
    // O resto da lógica de criação de perfil e tenant será tratada pelo DataContext
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
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">WhatsApp CRM</h1>
            <p className="text-muted-foreground mt-2">{isSignUp ? 'Crie a sua conta para começar' : 'Bem-vindo de volta!'}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-background border border-border rounded-md focus:ring-2 focus:ring-ring focus:border-transparent transition" placeholder="seu@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Senha</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-background border border-border rounded-md focus:ring-2 focus:ring-ring focus:border-transparent transition" placeholder="••••••••" />
            </div>
            {message.text && (
              <div className={`p-3 rounded-md text-sm flex items-center ${message.type === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-600'}`}>
                {message.type === 'error' ? <AlertCircle className="w-4 h-4 mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                {message.text}
              </div>
            )}
            <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-3 rounded-md font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center">
              {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
              {loading ? 'A processar...' : (isSignUp ? 'Criar Conta' : 'Entrar')}
            </button>
          </form>
          <div className="mt-6 text-center">
            <button onClick={() => { setIsSignUp(!isSignUp); setMessage({ text: '', type: 'error' }); }} className="text-primary hover:text-primary/90 text-sm font-medium">
              {isSignUp ? 'Já tem uma conta? Entre' : 'Não tem conta? Cadastre-se'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}