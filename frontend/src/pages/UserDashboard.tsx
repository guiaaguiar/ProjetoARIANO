import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, GraduationCap, Search, Award, Briefcase, TrendingUp, Network, Clock, ArrowRight, Info, ChevronRight, Activity, Target
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import * as api from '../lib/api';
import type { Match, Edital } from '../types';
import { UserDashboardGraph } from '../components/UserDashboardGraph';
import { cn } from '../lib/utils';

const MetricCard = ({ icon: Icon, title, value, status, colorClass, delay = 0 }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="relative p-6 rounded-[2rem] bg-card/40 border border-border backdrop-blur-xl group hover:border-primary/30 transition-all duration-500 overflow-hidden"
  >
    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
      <Icon className="w-32 h-32" />
    </div>
    
    <div className="flex justify-between items-start mb-8 relative z-10">
      <div className={cn("p-3 rounded-2xl transition-transform duration-500 group-hover:scale-110", colorClass)}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-[10px] font-bold tracking-widest uppercase py-1 px-2.5 rounded-full bg-muted/50 text-muted-foreground border border-border/50">
        {status}
      </span>
    </div>
    
    <div className="relative z-10">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">{title}</p>
      <h3 className="text-2xl font-bold tracking-tight text-foreground">{value}</h3>
    </div>
  </motion.div>
);

export default function UserDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [insight, setInsight] = useState<string>('O Orquestrador está mapeando sua influência no ecossistema...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      api.getGraphInsight(user.uid)
        .then(res => setInsight(res.insight))
        .catch(() => setInsight('Sincronização offline no momento.'));

      api.getMatches(user.uid, 0.45)
        .then(setMatches)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 pb-12"
    >

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.2em] text-[10px]">
            <Activity className="w-3 h-3" /> Dashboard do Pesquisador
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Bem-vindo, <span className="text-primary">{user?.name?.split(' ')[0]}</span>.
          </h1>
          <p className="text-muted-foreground text-[14px] max-w-md leading-relaxed">
            Sua maturidade no ecossistema foi calculada em <span className="text-foreground font-bold">{(user as any)?.maturidade || '7.5'}</span>. Explore novos matches estratégicos abaixo.
          </p>
        </motion.div>
        
        <div className="flex gap-3">
          <button className="h-10 px-4 rounded-xl bg-muted/50 border border-border text-[13px] font-semibold hover:bg-muted transition-colors flex items-center gap-2">
             Editar Perfil <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </header>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          icon={Award} 
          title="Status Cognitivo" 
          value="Inteligência Ativa" 
          status="Analisado" 
          colorClass="bg-primary/20 text-primary" 
        />
        <MetricCard 
          icon={Target} 
          title="Oportunidades" 
          value={`${matches.length} Editais`} 
          status="Match O(1)" 
          colorClass="bg-warning/20 text-warning" 
          delay={0.1}
        />
        <MetricCard 
          icon={Network} 
          title="Ecossistema" 
          value="Comunidade C-12" 
          status="Conectado" 
          colorClass="bg-info/20 text-info" 
          delay={0.2}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Matches Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" /> Matches Prioritários
              </h3>
              <p className="text-[12px] text-muted-foreground">Calculados via Graph-CoT em tempo real.</p>
            </div>
            <button 
              onClick={() => navigate('/user/matches')} 
              className="text-[11px] font-bold text-primary uppercase tracking-widest hover:translate-x-1 transition-transform flex items-center gap-1.5"
            >
              Ver Tudo <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              [1, 2, 3, 4].map(i => <div key={i} className="h-40 rounded-[1.5rem] bg-card/20 border border-border animate-pulse" />)
            ) : matches.length > 0 ? (
              matches.slice(0, 4).map((match, idx) => (
                <motion.div 
                  key={match.edital_uid}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-6 rounded-[1.5rem] bg-card/30 border border-border hover:border-primary/40 transition-all duration-300 group cursor-pointer relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="px-2 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-tighter">
                       {(match.score * 100).toFixed(0)}% Match
                    </div>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{match.agency}</span>
                  </div>
                  
                  <h4 className="text-[15px] font-bold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">{match.edital_title}</h4>
                  <p className="text-[12px] text-muted-foreground line-clamp-2 mb-6 leading-relaxed">{match.justification}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="flex -space-x-2">
                         {[1, 2].map(i => <div key={i} className="w-5 h-5 rounded-full bg-muted border border-border" />)}
                       </div>
                       <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">12 dias restantes</span>
                    </div>
                    <div className="p-2 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center rounded-[2rem] bg-card/10 border border-dashed border-border/50">
                <Info className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">Nenhum match processado ainda.</p>
                <button onClick={() => navigate('/cadastro')} className="mt-4 text-[12px] font-bold text-primary hover:underline">Refazer Análise IA</button>
              </div>
            )}
          </div>
        </div>

        {/* Ecosystem Preview */}
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Network className="w-5 h-5 text-primary" /> Ecossistema Vivo
            </h3>
            <p className="text-[12px] text-muted-foreground">Mapeamento dinâmico de influência.</p>
          </div>
          
          <div className="aspect-[4/5] rounded-[2rem] bg-card/20 border border-border relative overflow-hidden group shadow-2xl">
            <div className="absolute inset-0">
               <UserDashboardGraph />
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
            
            <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl bg-card/60 backdrop-blur-xl border border-border transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
               <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.15em] text-[9px] mb-2">
                 <Zap className="w-3 h-3" /> Insight do Orquestrador
               </div>
               <p className="text-[12px] text-foreground leading-relaxed italic">"{insight}"</p>
            </div>

            <button 
              onClick={() => navigate('/user/ecossistema')} 
              className="absolute top-4 right-4 p-2.5 rounded-xl bg-background/80 backdrop-blur-md border border-border text-foreground hover:bg-primary hover:text-primary-foreground transition-all shadow-xl"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
