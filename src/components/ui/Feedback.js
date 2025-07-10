// ==================================================================
// Ficheiro: src/components/ui/Feedback.js
// ==================================================================
import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

export const Loader = ({ text = "A carregar..." }) => (
  <div className="flex items-center justify-center h-full p-8">
    <div className="text-center">
      <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
      <p className="mt-4 text-muted-foreground">{text}</p>
    </div>
  </div>
);

export const ConfigurationError = () => (
  <div className="min-h-screen bg-destructive/10 flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-card rounded-2xl shadow-xl p-8 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
        <AlertCircle className="w-8 h-8 text-destructive" />
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Configuração Necessária</h1>
      <p className="text-muted-foreground mb-6">Para usar esta aplicação, configure as variáveis de ambiente do Supabase.</p>
      <div className="bg-muted rounded-md p-4 text-left">
        <p className="text-sm font-mono text-foreground mb-2">1. Crie um arquivo <code>.env.local</code> na raiz do projeto</p>
        <p className="text-sm font-mono text-foreground mb-2">2. Adicione suas credenciais:</p>
        <pre className="text-xs bg-gray-800 text-gray-100 p-3 rounded overflow-x-auto">{`REACT_APP_SUPABASE_URL=sua_url_aqui\nREACT_APP_SUPABASE_ANON_KEY=sua_chave_aqui`}</pre>
        <p className="text-sm font-mono text-foreground mt-2">3. Reinicie a aplicação</p>
      </div>
    </div>
  </div>
);