import React from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Globe, MessageSquare, ArrowRight } from 'lucide-react';

const COMMUNITIES = [
  { id: 1, name: 'Cluster IA & NLP PE', members: 42, activity: 'Alta', match: 94, color: 'text-teal-400', bg: 'bg-teal-500/10' },
  { id: 2, name: 'Grupo Pesquisa Grafos UFPE', members: 12, activity: 'Média', match: 82, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 3, name: 'Rede Saúde Digital Nordeste', members: 156, activity: 'Alta', match: 65, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { id: 4, name: 'Open Innovation Recife', members: 89, activity: 'Alta', match: 45, color: 'text-amber-400', bg: 'bg-amber-400/10' },
];

export default function UserCommunitiesPage() {
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
               <h2 className="text-5xl font-black text-white leading-tight">Você pertence ao <span className="text-teal-400">Cluster 04</span>.</h2>
               <p className="text-gray-400 text-lg leading-relaxed">
                  Sua pesquisa em <strong>IA aplicada a Grafos</strong> converge com 80% dos membros deste cluster. Esta é a comunidade com maior densidade de editais abertos para o seu perfil.
               </p>
               <div className="flex gap-4">
                  <button className="px-8 py-4 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-bold transition-all shadow-2xl shadow-teal-500/20">
                     Ingressar no Cluster
                  </button>
                  <button className="px-8 py-4 bg-gray-900 border border-white/10 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all">
                     Ver Membros
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
         <h3 className="text-xl font-bold text-white">Outras comunidades sugeridas</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {COMMUNITIES.map((community, idx) => (
               <motion.div
                 key={community.id}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: idx * 0.1 }}
                 className="p-6 rounded-3xl bg-gray-900/40 border border-white/5 hover:border-teal-500/30 transition-all group cursor-pointer"
               >
                  <div className={`w-12 h-12 rounded-2xl ${community.bg} ${community.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                     <MessageSquare className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{community.name}</h4>
                  <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-6">
                     <span>{community.members} Membros</span>
                     <span className={community.activity === 'Alta' ? 'text-teal-400' : 'text-gray-400'}>{community.activity} Atividade</span>
                  </div>
                  <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                     <div className="flex flex-col">
                        <span className="text-[9px] text-gray-500 uppercase font-black">Adjacência</span>
                        <span className={`text-lg font-black ${community.color}`}>{community.match}%</span>
                     </div>
                     <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                  </div>
               </motion.div>
            ))}
         </div>
      </div>
    </div>
  );
}
