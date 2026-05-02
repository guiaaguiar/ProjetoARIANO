import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import { Mail, Lock, ShieldAlert, ArrowRight, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { StackedLogo } from '../components/StackedLogo';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha muito curta'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, isAuthenticated, isLoading, user } = useAuthStore();

  const from = location.state?.from?.pathname || '/';

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (user?.type === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/user', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.detail || 'Credenciais inválidas');
      
      setUser({
        uid: result.user_uid,
        name: result.name || 'User',
        type: result.user_type,
      });

      toast.success(`Bem-vindo, ${result.name || 'User'}!`);
      
      if (result.user_type === 'admin') {
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

  const inputClasses = "w-full pl-10 pr-4 py-3 bg-background/50 border border-border rounded-2xl text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none";
  const labelClasses = "block text-[13px] font-medium text-muted-foreground mb-1.5 ml-1";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] space-y-8 z-10"
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <StackedLogo size={40} className="text-primary" />
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight uppercase tracking-[0.1em]">Bem-vindo de volta</h1>
            <p className="text-[14px] text-muted-foreground">Acesse sua conta no ecossistema ARIANO.</p>
          </div>
        </div>

        <div className="bg-card/40 border border-border backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className={labelClasses}>E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                <input 
                  {...register('email')} 
                  type="email" 
                  placeholder="usuario@instituicao.br" 
                  className={inputClasses} 
                />
              </div>
              {errors.email && <p className="text-[11px] text-destructive mt-1 ml-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 ml-1">
                <label className="text-[13px] font-medium text-muted-foreground">Senha</label>
                <Link to="#" className="text-[11px] text-primary hover:underline">Esqueceu a senha?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                <input 
                  {...register('password')} 
                  type="password" 
                  placeholder="••••••••" 
                  className={inputClasses} 
                />
              </div>
              {errors.password && <p className="text-[11px] text-destructive mt-1 ml-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-[14px] font-bold shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Settings className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Entrar no Ecossistema
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border/50">
            <div className="rounded-2xl bg-primary/5 p-4 border border-primary/10">
              <div className="flex gap-3">
                <ShieldAlert className="h-5 w-5 text-primary shrink-0" />
                <div className="space-y-1">
                  <h3 className="text-[12px] font-bold text-primary uppercase tracking-wider">Acesso Rápido</h3>
                  <div className="text-[11px] text-muted-foreground leading-relaxed">
                    <p>Admin: admin@ariano.gov / admin123</p>
                    <p>Demo: demo@estudante.com / 123456</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-[13px] text-muted-foreground">
          Ainda não tem conta? <Link to="/cadastro" className="text-primary font-bold hover:underline">Criar agora</Link>
        </p>
      </motion.div>
    </div>
  );
};
