import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  GraduationCap, 
  Search, 
  Award, 
  Briefcase, 
  TrendingUp, 
  Settings,
  Bell,
  LogOut,
  MapPin,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import * as api from '../lib/api';
import type { Match, Edital } from '../types';

export default function UserDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      api.getMatches(user.uid, 0.45)
        .then(setMatches)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-inter flex lg:flex-row flex-col">
      
      {/* Sidebar Mobile Navigation or Top Bar */}
      <div className="lg:hidden p-4 border-b border-white/10 flex justify-between items-center bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
        <h1 className="text-xl font-bold text-teal-500">ARIANO · CORETO</h1>
        <button onClick={handleLogout} className="p-2 text-gray-400"><LogOut className="w-5 h-5" /></button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full relative">
        
        {/* Decorative background blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] -z-10" />

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <motion.h2 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-white mb-2"
            >
              Olá, <span className="text-teal-400">{user?.name}</span>!
            </motion.h2>
            <p className="text-gray-400 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Portal do Estudante · {user?.type === 'student' ? 'Graduação' : 'Pós-Graduação'}
            </p>
          </div>
          <div className="flex gap-3">
             <button className="p-2.5 rounded-xl bg-gray-900/50 border border-white/10 hover:border-teal-500/50 transition-colors">
               <Bell className="w-5 h-5 text-gray-400" />
             </button>
             <button className="p-2.5 rounded-xl bg-gray-900/50 border border-white/10 hover:border-teal-500/50 transition-colors">
               <Settings className="w-5 h-5 text-gray-400" />
             </button>
             <button onClick={handleLogout} className="px-4 py-2.5 rounded-xl bg-gray-900/50 border border-white/10 hover:bg-red-500/10 hover:border-red-500/50 transition-colors text-red-400 flex items-center gap-2">
               <LogOut className="w-4 h-4" /> Sair
             </button>
          </div>
        </header>

        {/* Grid Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-3xl bg-gray-900/40 border border-white/10 backdrop-blur-md flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-teal-500/20 rounded-2xl text-teal-400"><Award className="w-6 h-6" /></div>
              <span className="text-xs text-teal-500 font-bold bg-teal-500/10 px-2 py-1 rounded-full">+12% vs last month</span>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Status do Perfil</p>
              <h3 className="text-2xl font-bold text-white">Excelente</h3>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-3xl bg-gray-900/40 border border-white/10 backdrop-blur-md flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-purple-500/20 rounded-2xl text-purple-400"><Zap className="w-6 h-6" /></div>
              <span className="text-xs text-purple-500 font-bold bg-purple-500/10 px-2 py-1 rounded-full">MATCHMAKING ATIVO</span>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Novas Oportunidades</p>
              <h3 className="text-2xl font-bold text-white">{matches.length} Editais Ativos</h3>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-3xl bg-gray-900/40 border border-white/10 backdrop-blur-md flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400"><Briefcase className="w-6 h-6" /></div>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Maturidade Acadêmica</p>
              <h3 className="text-2xl font-bold text-white">Nível 4</h3>
            </div>
          </motion.div>
        </div>

        {/* Matches Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-500" />
              Matches Recomendados pela ARIANO
            </h3>
            <button className="text-sm text-teal-400 hover:underline">Ver todos</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              [1, 2].map(i => <div key={i} className="h-44 rounded-3xl bg-gray-900/40 border border-white/10 animate-pulse" />)
            ) : matches.length > 0 ? (
              matches.slice(0, 4).map((match, idx) => (
                <motion.div 
                  key={match.edital_uid}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-6 rounded-3xl bg-gray-900/60 border border-white/10 hover:border-teal-500/30 transition-all group cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rotate-45 translate-x-12 -translate-y-12 group-hover:scale-110 transition-transform" />
                  
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold">
                       {(match.score * 100).toFixed(0)}% de Match
                    </span>
                    <span className="text-xs text-gray-500 font-medium">{match.agency}</span>
                  </div>

                  <h4 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-teal-400 transition-colors">
                    {match.edital_title}
                  </h4>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-6 text-justify">
                    {match.justification || 'Baseado em suas habilidades atuais encontradas no currículo.'}
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Remoto/Híbrido</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Expira em 12 dias</span>
                    </div>
                    <button className="p-2 rounded-full bg-teal-500 text-gray-950 group-hover:bg-teal-400 transition-colors shadow-lg shadow-teal-500/20">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full p-12 rounded-3xl bg-gray-900/20 border border-dashed border-white/10 text-center">
                <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Nenhum match encontrado para seu perfil ainda.</p>
                <button className="mt-4 text-teal-500 font-bold hover:underline">Atualizar Currículo</button>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
