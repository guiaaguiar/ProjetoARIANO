import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';

interface AuthPopupProps {
  requiredRole: 'admin' | 'user';
}

export const AuthPopup: React.FC<AuthPopupProps> = ({ requiredRole }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [errorStatus, setErrorStatus] = useState(false);
  const { setUser } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Triggers shake animation instead of closing
    if (e.target === e.currentTarget) {
      setShake(true);
      setErrorStatus(true);
      setTimeout(() => {
        setShake(false);
        setErrorStatus(false);
      }, 300);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
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

      // Check if logged in user role matches the required role
      if (requiredRole === 'admin' && data.user_type !== 'admin') {
         throw new Error('Acesso negado: Perfil de Administrador exigido.');
      }

      setUser({
        uid: data.user_uid,
        name: data.name || 'User',
        type: data.user_type,
      });

      toast.success(`Bem-vindo, ${data.name || 'User'}!`);
      
      // Auto-reload or navigate via state change to reveal the content
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao realizar login');
      setShake(true);
      setErrorStatus(true);
      setTimeout(() => {
        setShake(false);
        setErrorStatus(false);
      }, 300);
    } finally {
      setLoading(false);
    }
  };

  // Amin pages shouldn't have "Criar Conta"
  const isUserLogin = requiredRole === 'user';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-md"
      onClick={handleBackdropClick}
    >
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ x: shake ? [0, -10, 10, -10, 10, 0] : 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className={`max-w-md w-full bg-gray-900 border rounded-2xl shadow-2xl overflow-hidden glass-panel ${
            errorStatus ? 'border-red-500 shadow-red-500/20' : 'border-teal-900/30'
          }`}
        >
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">ARIANO</h2>
              <p className="text-gray-400">
                Acesse sua área de {requiredRole === 'admin' ? 'Administração' : 'Usuário'}.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className={`text-sm font-medium ${errorStatus ? 'text-red-400' : 'text-gray-300'}`}>Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className={`h-5 w-5 ${errorStatus ? 'text-red-500' : 'text-gray-500'}`} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-lg bg-gray-950 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
                      errorStatus ? 'border-red-500' : 'border-gray-800'
                    }`}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className={`text-sm font-medium ${errorStatus ? 'text-red-400' : 'text-gray-300'}`}>Senha</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 ${errorStatus ? 'text-red-500' : 'text-gray-500'}`} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-lg bg-gray-950 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
                      errorStatus ? 'border-red-500' : 'border-gray-800'
                    }`}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 rounded-lg shadow-sm font-medium text-white bg-teal-600 hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 transition-colors"
              >
                {loading ? <Settings className="w-5 h-5 animate-spin" /> : 'Entrar'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-800 text-center">
               <span className="text-gray-400 text-sm">
                 Entrando como <strong className="text-white uppercase">{requiredRole}</strong>
               </span>
               <div className="mt-2" />
               
               {isUserLogin && (
                 <button 
                  onClick={() => navigate('/cadastro')}
                  className="text-teal-400 hover:text-teal-300 font-medium text-sm transition-colors"
                 >
                   Criar Conta
                 </button>
               )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
