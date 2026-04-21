import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Trophy, Search, Cpu } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import * as api from '../lib/api';
import type { Match } from '../types';
import { MatchResultCards } from '../components/MatchResultCards';

export default function UserMatchesPage() {
  const user = useAuthStore(state => state.user);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(0.4); // Start with 40%

  const handleRecalculate = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      await api.calculateMatches({ entity_uid: user.uid });
      const data = await api.getMatches(user.uid, threshold);
      setMatches(data);
      toast.success('IA finalizou a análise do seu perfil!');
    } catch (err) {
      console.error('Erro ao recalcular:', err);
      toast.error('O Orquestrador está ocupado agora, tente novamente em instantes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.uid) return;

    setLoading(true);
    api.getMatches(user.uid, threshold)
      .then(data => {
        setMatches(data);
      })
      .catch(err => {
        console.error('Erro ao carregar matches:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user?.uid, threshold]);

  // Convert Match[] to MatchData[] for MatchResultCards
  const matchResultData = matches.map(m => ({
    title: m.edital_title,
    instituicao: 'Órgão de Fomento', // We could improve this by having institution in match
    score: Math.round(m.score * 100),
    justification: m.justification || 'Afinidade detectada pelo orquestrador com base em suas competências e maturidade acadêmica.'
  }));

  return (
    <div className="container-fluid py-6 max-w-5xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 bg-wallpaper-overlay p-8 rounded-2xl border border-border/40 overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-2 text-accent mb-2">
            <Trophy className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Elegibilidade Estratégica</span>
          </div>
          <h1 className="text-3xl font-bold text-text-primary">Meus Matches</h1>
          <p className="text-text-secondary mt-1 max-w-md">
            Estes são os editais e oportunidades mapeados pelo Orquestrador ARIANO especificamente para o seu perfil.
          </p>
        </motion.div>

        <div className="flex flex-col gap-2 w-full md:w-auto relative z-10">
          <div className="flex items-center justify-between gap-4 bg-void/50 backdrop-blur-md border border-border/50 px-5 py-3 rounded-xl">
             <div className="flex items-center gap-3">
               <Search className="w-4 h-4 text-text-muted" />
               <label className="text-xs font-medium text-text-secondary whitespace-nowrap uppercase tracking-tighter">Threshold de IA:</label>
             </div>
             <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min={0} 
                  max={100} 
                  value={threshold * 100}
                  onChange={e => setThreshold(Number(e.target.value) / 100)}
                  className="w-24 md:w-40 h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-accent" 
                />
                <span className="text-accent font-mono text-sm font-bold min-w-[3ch]">{(threshold * 100).toFixed(0)}%</span>
             </div>
          </div>
          <p className="text-[10px] text-text-muted text-right italic">Ajuste para ver matches com menor ou maior afinidade.</p>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="card-glass p-6 animate-pulse">
               <div className="h-4 bg-border/40 rounded w-1/3 mb-4" />
               <div className="h-8 bg-border/20 rounded w-full mb-4" />
               <div className="h-2 bg-border/30 rounded w-full" />
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {matches.length > 0 && (
            <div className="bg-accent/5 border border-accent/10 px-4 py-2 rounded-lg mb-6 inline-flex items-center gap-2">
              <Cpu className="w-4 h-4 text-accent" />
              <span className="text-xs font-medium text-accent-glow">
                A Inteligência processou {matches.length} oportunidades compatíveis com este threshold.
              </span>
            </div>
          )}
          
          {matches.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center p-12 bg-gray-900/20 border border-dashed border-gray-800 rounded-3xl text-center space-y-6">
               <Cpu className="w-12 h-12 text-teal-500/40" />
               <div className="space-y-2">
                 <h3 className="text-xl font-bold text-white">Análise em Processamento</h3>
                 <p className="text-sm text-gray-500 max-w-sm">
                   Nossos agentes de IA ainda estão mapeando suas arestas no ecossistema. 
                   Isso pode levar alguns instantes após o cadastro.
                 </p>
               </div>
               <button 
                 onClick={handleRecalculate}
                 className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-teal-500/20"
               >
                 Sincronizar Inteligência Agora
               </button>
            </div>
          )}
          
          {matches.length > 0 && <MatchResultCards matches={matchResultData} />}
          
          {matches.length > 0 && (
            <p className="text-center text-text-muted text-[11px] mt-12 max-w-sm mx-auto leading-relaxed">
              * O Score de Match é calculado via <strong>Graph Connectivity Analysis</strong> e <strong>Semantic Similarity</strong>. Novas oportunidades aparecem automaticamente à medida que novos editais entram no ecossistema.
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
