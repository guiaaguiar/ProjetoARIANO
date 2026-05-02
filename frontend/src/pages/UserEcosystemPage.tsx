import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Network, Search, Info, Filter, Share2, Activity, Zap, Layers, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import * as api from '../lib/api';
import { MiniGraphAnimation } from '../components/MiniGraphAnimation';
import { cn } from '../lib/utils';

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
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, [user?.uid]);

  return (
    <div className="space-y-12 pb-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.2em] text-[10px]">
            <Layers className="w-3 h-3" /> Topologia do Conhecimento
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Meu <span className="text-primary">Ecossistema</span>.
          </h1>
          <p className="text-muted-foreground text-[14px] max-w-md leading-relaxed">
            Visualize as conexões semânticas entre sua trajetória acadêmica e as oportunidades ativas no ecossistema ARIANO.
          </p>
        </motion.div>
        
        <div className="flex gap-3">
           <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-muted/50 border border-border text-muted-foreground hover:text-foreground transition-colors">
              <Filter className="w-4 h-4" />
           </button>
           <button className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-[13px] font-bold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
              <Share2 className="w-4 h-4" /> Compartilhar Rede
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
        {/* Graph Canvas */}
        <div className="xl:col-span-3 aspect-video lg:aspect-auto lg:h-[650px] rounded-[3rem] bg-card/20 border border-border relative overflow-hidden flex items-center justify-center group shadow-2xl backdrop-blur-sm">
          {/* Topographic Background Overlay */}
          <div className="absolute inset-0 hatching-bg opacity-30 pointer-events-none" />
          
          {loading ? (
            <div className="flex flex-col items-center gap-4 relative z-10">
              <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest animate-pulse">Mapeando Arestas...</p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="w-full h-full transform transition-transform duration-1000 group-hover:scale-105"
            >
               <MiniGraphAnimation step={3} />
            </motion.div>
          )}

          {/* Legend Overlay */}
          <div className="absolute bottom-8 left-8 flex items-center gap-2">
             <div className="px-5 py-2.5 rounded-2xl bg-card/80 backdrop-blur-xl border border-border flex items-center gap-4 shadow-2xl">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-primary" />
                   <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Você</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-info" />
                   <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Editais</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-warning" />
                   <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Competências</span>
                </div>
             </div>
          </div>
          
          <button className="absolute top-8 right-8 h-12 w-12 rounded-2xl bg-primary text-primary-foreground shadow-2xl shadow-primary/40 hover:scale-110 transition-all flex items-center justify-center">
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Insights */}
        <div className="space-y-6">
           <div className="p-8 rounded-[2.5rem] bg-card/40 border border-border backdrop-blur-xl flex flex-col gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <h3 className="text-xl font-bold text-foreground flex items-center gap-3 relative z-10">
                 <Zap className="w-5 h-5 text-primary" />
                 Graph Insights
              </h3>
              
              <div className="space-y-5 relative z-10">
                 <div className="space-y-2">
                    <p className="text-[10px] text-primary font-bold uppercase tracking-[0.15em]">Centralidade</p>
                    <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 text-[13px] text-foreground/80 leading-relaxed italic">
                       "{insight}"
                    </div>
                 </div>
                 
                 <div className="space-y-2">
                    <p className="text-[10px] text-info font-bold uppercase tracking-[0.15em]">Topologia</p>
                    <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 text-[13px] text-foreground/80 leading-relaxed">
                       Sua comunidade possui densidade de <span className="text-foreground font-bold">0.42</span>, indicando forte convergência técnica.
                    </div>
                 </div>
              </div>
              
              <button className="w-full py-4 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-2xl text-[12px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 mt-2">
                 Explorar Cluster <ChevronRight className="w-4 h-4" />
              </button>
           </div>

           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
             className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 relative overflow-hidden"
           >
              <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-[9px] mb-4">
                 <Activity className="w-3 h-3" /> Conectividade Global
              </div>
              <div className="flex items-end justify-between mb-4">
                 <span className="text-4xl font-black text-foreground">82%</span>
                 <span className="text-[11px] text-primary font-bold uppercase tracking-tight mb-1">Elite Técnica</span>
              </div>
              <div className="w-full h-1.5 bg-muted/50 rounded-full overflow-hidden">
                 <div className="w-[82%] h-full bg-primary shadow-[0_0_15px_rgba(45,212,191,0.4)]" />
              </div>
           </motion.div>
        </div>
      </div>
    </div>
  );
}
