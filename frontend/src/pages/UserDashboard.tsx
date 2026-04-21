import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  GraduationCap, 
  Search, 
  Award, 
  Briefcase, 
  TrendingUp, 
  Network,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import * as api from '../lib/api';
import type { Match, Edital } from '../types';
import { UserDashboardGraph } from '../components/UserDashboardGraph';

export default function UserDashboard() {
  const { user } = useAuthStore();
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

  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <motion.h2 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold text-white mb-2 tracking-tight"
          >
            Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">{user?.name}</span>!
          </motion.h2>
          <p className="text-gray-400 flex items-center gap-2 font-medium">
            <GraduationCap className="w-5 h-5 text-teal-500" />
            {user?.type === 'student' ? 'Estudante' : user?.type === 'researcher' ? 'Pesquisador' : 'Professor'} · Ecossistema CORETO
          </p>
        </div>
        <div className="flex gap-3">
           <div className="px-4 py-2 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex flex-col items-center">
             <span className="text-[10px] uppercase tracking-widest text-teal-500 font-bold">Maturidade IA</span>
             <span className="text-xl font-black text-white">{(user as any)?.maturidade || '7.5'}</span>
           </div>
        </div>
      </header>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl bg-gray-900/40 border border-teal-500/10 backdrop-blur-md flex flex-col justify-between group hover:border-teal-500/30 transition-all"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-teal-500/20 rounded-2xl text-teal-400 group-hover:scale-110 transition-transform"><Award className="w-6 h-6 outline-none" /></div>
            <span className="text-[10px] text-teal-400 font-bold bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/10 tracking-widest uppercase">Perfil Analisado</span>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-bold">Status Cognitivo</p>
            <h3 className="text-2xl font-bold text-white">Inteligência Ativa</h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-3xl bg-gray-900/40 border border-teal-500/10 backdrop-blur-md flex flex-col justify-between group hover:border-teal-500/30 transition-all"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-purple-500/20 rounded-2xl text-purple-400 group-hover:scale-110 transition-transform"><Zap className="w-6 h-6" /></div>
            <span className="text-[10px] text-purple-400 font-bold bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/10 tracking-widest uppercase">Matchmaking O(1)</span>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-bold">Oportunidades</p>
            <h3 className="text-2xl font-bold text-white">{matches.length} Editais</h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-3xl bg-gray-900/40 border border-teal-500/10 backdrop-blur-md flex flex-col justify-between group hover:border-teal-500/30 transition-all"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400 group-hover:scale-110 transition-transform"><Network className="w-6 h-6" /></div>
            <span className="text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/10 tracking-widest uppercase">Conexões Localizadas</span>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-bold">Ecossistema</p>
            <h3 className="text-2xl font-bold text-white">Comunidade C-12</h3>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Matches */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-teal-400" />
              Matches Prioritários
            </h3>
            <button onClick={() => navigate('/user/matches')} className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1 uppercase tracking-widest">
              Ver tudo <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              [1, 2].map(i => <div key={i} className="h-44 rounded-3xl bg-gray-900/40 border border-white/10 animate-pulse" />)
            ) : matches.length > 0 ? (
              matches.slice(0, 4).map((match, idx) => (
                <motion.div 
                  key={match.edital_uid}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-5 rounded-2xl bg-gray-900/40 border border-white/5 hover:border-teal-500/30 transition-all group cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-black text-teal-400 bg-teal-400/10 px-2 py-0.5 rounded tracking-tighter uppercase">
                       {(match.score * 100).toFixed(0)}% Match
                    </span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase">{match.agency}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-2 line-clamp-1">{match.edital_title}</h4>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">{match.justification}</p>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-gray-500 flex items-center gap-1 font-bold"><Clock className="w-3 h-3" /> 12 DIAS RESTANTES</span>
                    <ArrowRight className="w-4 h-4 text-teal-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full p-12 text-center rounded-3xl bg-gray-900/20 border border-dashed border-gray-800">
                <p className="text-gray-500 font-medium">Nenhum match processado ainda.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Mini Ecosystem Graph */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <Network className="w-5 h-5 text-teal-400" />
              Meu Ecossistema
            </h3>
          </div>
          
          <div className="aspect-square rounded-3xl bg-gray-900/60 border border-teal-500/10 relative overflow-hidden group">
            {/* Real Graph Visualization */}
            <div className="absolute inset-0">
               <UserDashboardGraph />
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-60" />
            
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-gray-900/80 backdrop-blur-md border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
               <p className="text-[10px] text-teal-400 font-bold uppercase mb-1">Dica Cognitiva</p>
               <p className="text-[11px] text-gray-300 leading-relaxed">Você está conectado a 4 consultores da FACEPE através da sua skill em IA aplicada.</p>
            </div>

            <button onClick={() => navigate('/user/ecossistema')} className="absolute top-4 right-4 p-2 rounded-lg bg-gray-900 shadow-xl border border-white/10 text-gray-400 hover:text-white transition-colors">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
