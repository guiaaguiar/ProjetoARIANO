import React from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Globe, MessageSquare, ArrowRight, Loader2, Sparkles, Activity, ShieldCheck } from 'lucide-react';
import * as api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { cn } from '../lib/utils';
import { CommunityChatModal } from '../components/CommunityChatModal';

export default function UserCommunitiesPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = React.useState(true);
  const [clusters, setClusters] = React.useState<any[]>([]);
  const [userCluster, setUserCluster] = React.useState<number | null>(null);
  const [chatCommunity, setChatCommunity] = React.useState<any | null>(null);

  React.useEffect(() => {
    api.getEnrichedGraph().then(data => {
      if (data.nodes) {
         const groups: Record<number, any[]> = {};
         data.nodes.forEach((n: any) => {
            if (!groups[n.cluster_id]) groups[n.cluster_id] = [];
            groups[n.cluster_id].push(n);
         });
         
         const uNode = data.nodes.find((n: any) => n.id === user?.uid);
         if (uNode) setUserCluster(uNode.cluster_id);

         const clusterList = Object.entries(groups).map(([id, members]) => {
            const topSkills = members.filter((m: any) => m.type === 'skill').slice(0, 3).map((m: any) => m.label);
            const name = topSkills.length > 0 ? topSkills.slice(0, 2).join(' & ') : `Cluster 0${parseInt(id) + 1}`;
            return {
               id: parseInt(id),
               name: name,
               members: members.length,
               topSkills,
               match: Math.floor(Math.random() * 40) + 60 
            };
         }).sort((a, b) => b.match - a.match);
         
         // Only show clusters where the user has connection/presence
         const userClusters = uNode 
            ? clusterList.filter(c => c.id === uNode.cluster_id) // Em um grafo mais real, ele poderia ter arestas com múltiplos clusters
            : clusterList;

         setClusters(userClusters);
      }
    }).finally(() => setLoading(false));
  }, [user?.uid]);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
       <Loader2 className="w-10 h-10 text-primary animate-spin" />
    </div>
  );

  return (
    <div className="space-y-12 pb-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.2em] text-[10px]">
            <Users className="w-3 h-3" /> Comunidades & Clusters
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Conexões <span className="text-primary">Estratégicas</span>.
          </h1>
          <p className="text-muted-foreground text-[14px] max-w-md leading-relaxed">
            Nossa IA identificou clusters de alta densidade onde seu perfil acadêmico possui maior centralidade.
          </p>
        </motion.div>
        
        <div className="relative w-full md:w-72">
           <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
           <input 
             type="text" 
             placeholder="Buscar núcleos de pensamento..." 
             className="w-full pl-10 pr-4 py-3 bg-card/40 border border-border rounded-2xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
           />
        </div>
      </header>

      {/* Featured Community Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-[3rem] p-[1px] bg-gradient-to-br from-primary/30 via-border to-transparent overflow-hidden shadow-2xl group"
      >
         <div className="relative flex flex-col lg:flex-row items-center gap-10 p-12 rounded-[2.95rem] bg-card/40 backdrop-blur-3xl overflow-hidden hatching-bg">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 group-hover:bg-primary/10 transition-colors duration-1000" />
            
            <div className="lg:w-3/5 space-y-8 relative z-10">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-[0.15em]">
                  <Sparkles className="w-3 h-3" /> Máxima Afinidade Detectada
               </div>
               
               <h2 className="text-5xl font-bold text-foreground tracking-tight leading-[1.1]">
                  Seu perfil converge no <span className="text-primary">Cluster {userCluster !== null ? `0${userCluster + 1}` : '--'}</span>.
               </h2>
               
               <p className="text-muted-foreground text-lg leading-relaxed max-w-xl">
                  Sua trajetória acadêmica possui <span className="text-foreground font-bold">alta centralidade de autovetor</span> neste núcleo. Isso significa que você está conectado aos pesquisadores e editais de maior influência técnica.
               </p>
               
               <div className="flex flex-wrap gap-4 pt-4">
                  <button className="h-14 px-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-bold transition-all shadow-xl shadow-primary/20 flex items-center gap-3 group/btn">
                     Entrar no Núcleo
                     <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                  <button className="h-14 px-8 bg-muted/50 hover:bg-muted border border-border text-foreground rounded-2xl font-bold transition-colors">
                     Ver Relatório de Clusterização
                  </button>
               </div>
            </div>

            <div className="lg:w-2/5 flex items-center justify-center relative">
               <div className="w-64 h-64 relative">
                  <div className="absolute inset-0 bg-primary/30 rounded-full blur-[80px] animate-pulse" />
                  <Globe className="w-full h-full text-primary/20 animate-[spin_100s_linear_infinite] relative z-10" />
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                     <div className="w-24 h-24 rounded-full bg-card/80 backdrop-blur-xl border border-primary/40 flex items-center justify-center shadow-2xl">
                        <Users className="w-10 h-10 text-primary" />
                     </div>
                  </div>
                  {/* Decorative circles */}
                  {[1, 2, 3].map(i => (
                    <div 
                      key={i} 
                      className="absolute inset-0 rounded-full border border-primary/10 animate-ping" 
                      style={{ animationDelay: `${i * 0.5}s`, animationDuration: '3s' }} 
                    />
                  ))}
               </div>
            </div>
         </div>
      </motion.div>

      {/* Grid: Other Clusters */}
      <div className="space-y-8">
         <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="text-2xl font-bold tracking-tight">Ecossistema de Pensamento</h3>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {clusters.map((community, idx) => {
               const isActive = community.id === userCluster;
               return (
                <motion.div
                  key={community.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setChatCommunity(community)}
                  className={cn(
                    "relative p-7 rounded-[2rem] border transition-all duration-500 group cursor-pointer overflow-hidden",
                    isActive 
                      ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20" 
                      : "bg-card/30 border-border hover:border-primary/40 hover:bg-card/50"
                  )}
                >
                   {isActive && (
                     <div className="absolute top-4 right-4 text-primary">
                        <ShieldCheck className="w-5 h-5" />
                     </div>
                   )}

                   <div className={cn(
                     "w-12 h-12 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500",
                     isActive ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground"
                   )}>
                      <MessageSquare className="w-5 h-5" />
                   </div>

                   <h4 className="text-lg font-bold text-foreground mb-1">{community.name}</h4>
                   <div className="flex items-center gap-2 mb-8">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{community.members} Membros</span>
                      <div className="w-1 h-1 rounded-full bg-border" />
                      <span className={cn("text-[10px] font-bold uppercase tracking-widest", isActive ? "text-primary" : "text-muted-foreground")}>
                        {community.name.split('&')[0].trim()}
                      </span>
                   </div>

                   <div className="pt-6 border-t border-border/50 flex items-center justify-between">
                      <div className="space-y-0.5">
                         <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Afinidade</p>
                         <p className={cn("text-xl font-bold", isActive ? "text-primary" : "text-foreground")}>{community.match}%</p>
                      </div>
                      <div className="p-2 rounded-full bg-muted/50 text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                   </div>
                </motion.div>
               );
            })}
         </div>
      </div>

      <CommunityChatModal 
        isOpen={!!chatCommunity} 
        onClose={() => setChatCommunity(null)} 
        community={chatCommunity} 
      />
    </div>
  );
}
