import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import { Mail, Lock, ShieldAlert, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, isAuthenticated, isLoading, user } = useAuthStore();

  const from = location.state?.from?.pathname || '/';

  React.useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (user?.type === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/user', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Usando request direto para backend da mesma origem devido a proxy configurado
      // MOCK temporário sem axios enquanto auth backend se configura
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error('Credenciais inválidas');
      }

      const data = await res.json();
      
      setUser({
        uid: data.user_uid,
        name: data.name || 'User',
        type: data.user_type,
      });

      toast.success(`Bem-vindo, ${data.name || 'User'}!`);
      
      // Redirect based on role or original planned destination
      if (data.user_type === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from === '/login' || from === '/' ? '/user' : from, { replace: true });
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao realizar login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4 font-inter relative overflow-hidden backdrop-blur-3xl bg-opacity-80">
      <div 
        className="absolute inset-0 z-0 pointer-events-none" 
        style={{
          backgroundImage: `radial-gradient(circle at 15% 50%, rgba(20, 184, 166, 0.05), transparent 25%),
                            radial-gradient(circle at 85% 30%, rgba(20, 184, 166, 0.05), transparent 25%)`,
          backgroundSize: '100% 100%'
        }}
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-gray-900 border border-teal-900/30 rounded-2xl shadow-2xl overflow-hidden z-10 glass-panel"
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">ARIANO</h2>
            <p className="text-gray-400">Entre na plataforma de matchmaking acadêmico-governamental.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-800 rounded-lg bg-gray-950 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">Senha</label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-800 rounded-lg bg-gray-950 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-800">
            <div className="rounded-md bg-blue-900/20 p-4 border border-blue-900/30">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ShieldAlert className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-400">Ambiente de Testes</h3>
                  <div className="mt-2 text-sm text-blue-300/80">
                    <p>Admin Demo: admin@ariano.gov / admin123</p>
                    <p>Usuário Demo: Use um e-mail cadastrado / 123456</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center">
             <Link to="/cadastro" className="text-teal-400 hover:text-teal-300 font-medium inline-flex items-center gap-1 group">
               Criar nova conta CORETO
               <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
             </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
