import React from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Globe, MessageSquare, ArrowRight, Loader2 } from 'lucide-react';
import * as api from '../lib/api';
import { useAuthStore } from '../store/authStore';

export default function UserCommunitiesPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = React.useState(true);
  const [clusters, setClusters] = React.useState<any[]>([]);
  const [userCluster, setUserCluster] = React.useState<number | null>(null);

  React.useEffect(() => {
    api.getEnrichedGraph().then(data => {
      if (data.nodes) {
         // Agrupar nós por cluster_id
         const groups: Record<number, any[]> = {};
         data.nodes.forEach((n: any) => {
            if (!groups[n.cluster_id]) groups[n.cluster_id] = [];
            groups[n.cluster_id].push(n);
         });
         
         const clusterList = Object.entries(groups).map(([id, members]) => ({
            id: parseInt(id),
            name: `Cluster ${id}`,
            members: members.length,
            topSkills: members.filter(m => m.type === 'skill').slice(0, 3).map(m => m.label),
            match: Math.floor(Math.random() * 40) + 60 // Simulação de afinidade
         }));
         
         setClusters(clusterList);
         
         // Achar o cluster do usuário logado
         const uNode = data.nodes.find((n: any) => n.id === user?.uid);
         if (uNode) setUserCluster(uNode.cluster_id);
      }
    }).finally(() => setLoading(false));
  }, [user?.uid]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-950">
       <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
    </div>
  );
  return (
    <div className="container-fluid py-6 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-teal-400 mb-2">
            <Users className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Conexões Estratégicas</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white">Comunidades de Pensamento</h1>
          <p className="text-gray-400 mt-2 max-w-lg">
            Descubra em quais grupos seu perfil acadêmico possui maior centralidade e influência.
          </p>
        </div>
        
        <div className="relative w-full md:w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
           <input 
             type="text" 
             placeholder="Buscar comunidades..." 
             className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-white/5 rounded-2xl text-sm focus:border-teal-500/50 transition-all outline-none"
           />
        </div>
      </div>

      {/* Featured Community */}
      <div className="p-1 rounded-[2.5rem] bg-gradient-to-br from-teal-500/50 via-blue-500/50 to-transparent">
         <div className="flex flex-col lg:flex-row items-center gap-10 p-10 rounded-[2.4rem] bg-gray-950 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 blur-[100px] -z-0" />
            
            <div className="lg:w-1/2 space-y-6 relative z-10">
               <span className="px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-[10px] font-bold text-teal-400 uppercase tracking-widest">Afinidade Suprema</span>
               <h2 className="text-5xl font-black text-white leading-tight">Você pertence ao <span className="text-teal-400">Cluster {userCluster !== null ? `0${userCluster + 1}` : '--'}</span>.</h2>
               <p className="text-gray-400 text-lg leading-relaxed">
                  Seu perfil acadêmico converge com o núcleo desta comunidade. Esta é a zona de maior densidade de editais e pesquisadores parceiros para você.
               </p>
               <div className="flex gap-4">
                  <button className="px-8 py-4 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-bold transition-all shadow-2xl shadow-teal-500/20">
                     Explorar Comunidade
                  </button>
               </div>
            </div>

            <div className="lg:w-1/2 relative flex items-center justify-center">
               <div className="w-80 h-80 relative">
                  <div className="absolute inset-0 bg-teal-500/20 rounded-full blur-3xl animate-pulse" />
                  <Globe className="w-full h-full text-teal-500/30 animate-[spin_60s_linear_infinite]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                     <Users className="w-20 h-20 text-teal-400" />
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Recommended Communities Grid */}
      <div className="space-y-6">
         <h3 className="text-xl font-bold text-white">Ecossistema de Clusters (NetworkX)</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {clusters.map((community, idx) => {
               const CLUSTER_COLORS = ['text-teal-400', 'text-blue-400', 'text-purple-400', 'text-amber-400', 'text-red-400'];
               const CLUSTER_BGS = ['bg-teal-500/10', 'bg-blue-500/10', 'bg-purple-500/10', 'bg-amber-500/10', 'bg-red-500/10'];
               const color = CLUSTER_COLORS[community.id % CLUSTER_COLORS.length];
               const bg = CLUSTER_BGS[community.id % CLUSTER_BGS.length];

               return (
               <motion.div
                 key={community.id}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: idx * 0.1 }}
                 className="p-6 rounded-3xl bg-gray-900/40 border border-white/5 hover:border-teal-500/30 transition-all group cursor-pointer"
               >
                  <div className={`w-12 h-12 rounded-2xl ${bg} ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                     <MessageSquare className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{community.name}</h4>
                  <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-6">
                     <span>{community.members} Membros</span>
                     <span className={community.id === userCluster ? 'text-teal-400' : 'text-gray-400'}>
                        {community.id === userCluster ? 'Sua Comunidade' : 'Sugestão'}
                     </span>
                  </div>
                  <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                     <div className="flex flex-col">
                        <span className="text-[9px] text-gray-500 uppercase font-black">Centralidade</span>
                        <span className={`text-lg font-black ${color}`}>{community.match}%</span>
                     </div>
                     <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                  </div>
               </motion.div>
               );
            })}
         </div>
      </div>
    </div>
  );
}
