import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Network, Search, Info, Filter, Share2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import * as api from '../lib/api';
import { MiniGraphAnimation } from '../components/MiniGraphAnimation';

export default function UserEcosystemPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [insight, setInsight] = useState<string>('O Orquestrador está analisando sua centralidade...');

  useEffect(() => {
    if (user?.uid) {
      api.getGraphInsight(user.uid)
        .then(res => setInsight(res.insight))
        .catch(() => setInsight('Sincronização offline no momento.'));
    }
    // Simula carregamento do grafo individual
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, [user?.uid]);

  return (
    <div className="container-fluid py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-900/40 p-8 rounded-3xl border border-teal-500/10 backdrop-blur-xl group overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-teal-400 mb-3">
            <Network className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">Visualização Relacional</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white">Meu Ecossistema</h1>
          <p className="text-gray-400 mt-2 max-w-lg">
            Explore como suas competências se conectam aos editais, pesquisadores e grupos de pesquisa do ecossistema ARIANO.
          </p>
        </div>

        <div className="flex gap-3 relative z-10">
           <button className="p-3 rounded-2xl bg-gray-800 border border-white/5 text-gray-400 hover:text-white transition-all">
             <Filter className="w-5 h-5" />
           </button>
           <button className="p-3 rounded-2xl bg-gray-800 border border-white/5 text-gray-400 hover:text-white transition-all">
             <Share2 className="w-5 h-5" />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Graph Canvas */}
        <div className="xl:col-span-3 aspect-video lg:aspect-auto lg:h-[600px] rounded-3xl bg-gray-950 border border-white/5 relative overflow-hidden flex items-center justify-center group shadow-2xl">
          {/* Topographic Background Overlay */}
          <div className="absolute inset-0 bg-wallpaper opacity-10 pointer-events-none" />
          
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
              <p className="text-xs text-teal-500 font-mono animate-pulse">Sincronizando Arestas...</p>
            </div>
          ) : (
            <div className="w-full h-full scale-150 transform transition-transform duration-1000 group-hover:scale-125">
               <MiniGraphAnimation step={3} />
            </div>
          )}

          {/* Controls Overlay */}
          <div className="absolute bottom-6 left-6 flex items-center gap-2">
             <div className="px-4 py-2 rounded-xl bg-gray-900/90 border border-white/10 backdrop-blur-md flex items-center gap-3 shadow-xl">
                <div className="flex items-center gap-1.5">
                   <div className="w-2 h-2 rounded-full bg-teal-500" />
                   <span className="text-[10px] text-gray-300 font-bold uppercase">Você</span>
                </div>
                <div className="flex items-center gap-1.5">
                   <div className="w-2 h-2 rounded-full bg-blue-500" />
                   <span className="text-[10px] text-gray-300 font-bold uppercase">Editais</span>
                </div>
                <div className="flex items-center gap-1.5">
                   <div className="w-2 h-2 rounded-full bg-purple-500" />
                   <span className="text-[10px] text-gray-300 font-bold uppercase">Skills</span>
                </div>
             </div>
          </div>
          
          <button className="absolute top-6 right-6 p-3 rounded-2xl bg-teal-500 text-gray-950 shadow-2xl shadow-teal-500/40 hover:scale-110 transition-all">
            <Search className="w-6 h-6" />
          </button>
        </div>

        {/* Sidebar Insights */}
        <div className="space-y-6">
           <div className="p-6 rounded-3xl bg-gray-900/40 border border-teal-500/10 backdrop-blur-md flex flex-col gap-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 <Info className="w-5 h-5 text-teal-400" />
                 Insights de Rede (NetworkX)
              </h3>
              <div className="space-y-4">
                 <div className="p-4 rounded-2xl bg-gray-950/50 border border-white/5">
                    <p className="text-xs text-teal-400 font-bold uppercase mb-1">Posição Estratégica</p>
                    <p className="text-xs text-gray-400 leading-relaxed">{insight}</p>
                 </div>
                 <div className="p-4 rounded-2xl bg-gray-950/50 border border-white/5">
                    <p className="text-xs text-blue-400 font-bold uppercase mb-1">Topologia de Clusters</p>
                    <p className="text-xs text-gray-400 leading-relaxed">Sua comunidade possui densidade de 0.42, indicando forte colaboração interna.</p>
                 </div>
              </div>
              <button className="w-full py-4 mt-2 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition-all">
                 Explorar Cluster Completo
              </button>
           </div>

           <div className="p-6 rounded-3xl bg-gradient-to-br from-teal-500/20 to-blue-500/5 border border-teal-500/20">
              <h4 className="text-sm font-bold text-white mb-2">Conectividade Global</h4>
              <div className="flex items-end justify-between">
                 <span className="text-4xl font-black text-white">82%</span>
                 <span className="text-[10px] text-teal-400 font-bold uppercase mb-1 tracking-tighter">Acima da média</span>
              </div>
              <div className="w-full h-1.5 bg-gray-900 rounded-full mt-4 overflow-hidden">
                 <div className="w-[82%] h-full bg-teal-500 shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
