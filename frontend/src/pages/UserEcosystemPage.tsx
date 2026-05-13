import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Network, Share2, Activity, Zap, Layers, ChevronRight, Info } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import * as api from '../lib/api';
import { NetworkXGraphView } from '../components/NetworkXGraphView';

interface PersonalStats {
  density: number;
  connectivity_score: number;
  influence_percentile: number;
  cluster_theme: string;
  node_count: number;
  edge_count: number;
}

const TIER_LABELS: { threshold: number; label: string }[] = [
  { threshold: 0.85, label: 'Elite Técnica' },
  { threshold: 0.65, label: 'Alta Conectividade' },
  { threshold: 0.40, label: 'Nó Emergente' },
  { threshold: 0.00, label: 'Em Indexação' },
];

function getTierLabel(percentile: number): string {
  return TIER_LABELS.find(t => percentile >= t.threshold)?.label ?? 'Em Indexação';
}

export default function UserEcosystemPage() {
  const { user } = useAuthStore();
  const [insight, setInsight] = useState<string>('O Orquestrador está analisando sua centralidade...');
  const [personalStats, setPersonalStats] = useState<PersonalStats | null>(null);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const navigateRef = useRef<((uid: string) => void) | null>(null);

  useEffect(() => {
    if (user?.uid) {
      api.getGraphInsight(user.uid)
        .then(res => setInsight(res.insight))
        .catch(() => setInsight('Análise de centralidade offline no momento.'));
    }
  }, [user?.uid]);

  const handleStatsLoaded = useCallback((stats: Record<string, unknown>) => {
    setPersonalStats(stats as unknown as PersonalStats);
  }, []);

  const personalApiUrl = user?.uid
    ? `/api/graph/personal/${user.uid}`
    : undefined;

  const connectivityPct = personalStats
    ? Math.round(personalStats.connectivity_score * 100)
    : null;

  const tierLabel = personalStats
    ? getTierLabel(personalStats.influence_percentile)
    : '—';

  const densityDisplay = personalStats
    ? personalStats.density.toFixed(2)
    : '—';

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
          <button className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-[13px] font-bold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
            <Share2 className="w-4 h-4" /> Compartilhar Rede
          </button>
        </div>
      </header>

      <div className="space-y-6">
        {/* Graph Canvas — NetworkXGraphView real */}
        <div className="w-full aspect-square lg:aspect-auto lg:h-[750px] rounded-[3rem] relative overflow-hidden shadow-2xl bg-card/20 border border-border">
          {personalApiUrl ? (
            <>
              <NetworkXGraphView
                apiUrl={personalApiUrl}
                onStatsLoaded={handleStatsLoaded}
                onNavigateToNode={navigateRef}
                showCoT={true}
                filterPanelOpen={false}
                detailPanelOpen={!!selectedNode}
                onNodeClick={(node) => setSelectedNode(node)}
                onBackgroundClick={() => setSelectedNode(null)}
                selectedNodeId={selectedNode?.id}
                isUserMode={true}
              />
              
              {/* Painel de Detalhes do Nó */}
              {selectedNode && (
                <div className="absolute top-0 right-0 h-full w-80 bg-background/95 backdrop-blur-xl border-l border-border p-6 shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-y-auto z-10 transition-transform">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-black text-foreground leading-tight">{selectedNode.label}</h3>
                    <button 
                      onClick={() => setSelectedNode(null)}
                      className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-white"
                    >
                      <Zap className="w-4 h-4" /> {/* Botão de fechar (substituir por X ou Zap) */}
                    </button>
                  </div>
                  
                  <div className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-6 bg-primary/10 text-primary border border-primary/20">
                    Tipo: {selectedNode.type}
                  </div>
                  
                  {/* Descrição / Tema */}
                  {(selectedNode.metadata?.description || selectedNode.cluster_theme) && (
                    <div className="mb-6 space-y-2">
                      <p className="text-[10px] text-info font-bold uppercase tracking-widest">Detalhes</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {selectedNode.metadata?.description as string || `Relacionado ao cluster ${selectedNode.cluster_theme}`}
                      </p>
                    </div>
                  )}

                  {/* Conexões (apenas com o usuário) */}
                  <div className="space-y-3">
                    <p className="text-[10px] text-success font-bold uppercase tracking-widest flex items-center gap-1">
                      <Network className="w-3 h-3" /> Sua Conexão
                    </p>
                    
                    <div className="space-y-2">
                      {selectedNode.connections
                        ?.filter((conn: any) => conn.uid === user?.uid || selectedNode.id === user?.uid)
                        .map((conn: any, i: number) => (
                        <div key={i} className="p-3 bg-muted/20 border border-border/40 rounded-xl relative overflow-hidden group">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-success/50 group-hover:bg-success transition-colors" />
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1 font-semibold">
                            {conn.edge_type.replace(/_/g, ' ')}
                          </p>
                          <p className="text-sm font-bold text-foreground">
                            {conn.uid === user?.uid ? 'Você' : conn.label}
                          </p>
                          {conn.score && (
                            <div className="mt-2 text-xs font-mono text-success">
                              Match: {Math.round(conn.score * 100)}%
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {(!selectedNode.connections || selectedNode.connections.filter((conn: any) => conn.uid === user?.uid || selectedNode.id === user?.uid).length === 0) && (
                        <div className="p-3 bg-muted/10 border border-border/20 rounded-xl text-center">
                          <p className="text-xs text-muted-foreground">Você não possui conexão direta com este nó no grafo.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <Network className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-sm">Faça login para ver seu ecossistema.</p>
            </div>
          )}
        </div>

        {/* Sidebar Insights agora embaixo, em grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Graph Insights */}
          <div className="lg:col-span-2 p-8 rounded-[2.5rem] bg-card/40 border border-border backdrop-blur-xl flex flex-col gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <h3 className="text-xl font-bold text-foreground flex items-center gap-3 relative z-10">
              <Zap className="w-5 h-5 text-primary" />
              Graph Insights
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <div className="space-y-2">
                <p className="text-[10px] text-primary font-bold uppercase tracking-[0.15em]">Centralidade</p>
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 text-[13px] text-foreground/80 leading-relaxed italic h-full">
                  "{insight}"
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] text-info font-bold uppercase tracking-[0.15em]">Topologia</p>
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 text-[13px] text-foreground/80 leading-relaxed h-full">
                  {personalStats ? (
                    <>
                      Sua comunidade possui densidade de{' '}
                      <span className="text-foreground font-bold">{densityDisplay}</span>,
                      cluster <span className="text-primary font-bold">"{personalStats.cluster_theme}"</span>.
                    </>
                  ) : (
                    <span className="text-muted-foreground">Calculando topologia…</span>
                  )}
                </div>
              </div>
            </div>

            {personalStats && (
              <div className="flex gap-4 text-center mt-2 relative z-10">
                <div className="flex-1 p-3 rounded-xl bg-muted/20 border border-border/40 flex items-center justify-center gap-3">
                  <p className="text-xs font-bold text-primary">Nós na rede:</p>
                  <p className="text-lg font-black text-foreground">{personalStats.node_count}</p>
                </div>
                <div className="flex-1 p-3 rounded-xl bg-muted/20 border border-border/40 flex items-center justify-center gap-3">
                  <p className="text-xs font-bold text-info">Conexões ativas:</p>
                  <p className="text-lg font-black text-foreground">{personalStats.edge_count}</p>
                </div>
              </div>
            )}
          </div>

          {/* Conectividade Global */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 relative overflow-hidden flex flex-col justify-center"
          >
            <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-[9px] mb-4">
              <Activity className="w-3 h-3" /> Conectividade Global
            </div>
            <div className="flex items-end justify-between mb-4">
              <span className="text-4xl font-black text-foreground">
                {connectivityPct !== null ? `${connectivityPct}%` : '—'}
              </span>
              <span className="text-[11px] text-primary font-bold uppercase tracking-tight mb-1">
                {tierLabel}
              </span>
            </div>
            <div className="w-full h-1.5 bg-muted/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary shadow-[0_0_15px_rgba(45,212,191,0.4)] transition-all duration-1000"
                style={{ width: connectivityPct !== null ? `${connectivityPct}%` : '0%' }}
              />
            </div>
            {!personalStats && (
              <p className="text-[10px] text-muted-foreground mt-3 flex items-center gap-1">
                <Info className="w-3 h-3" /> Carregando dados do grafo…
              </p>
            )}
            
            <button className="w-full py-3 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 mt-6">
              Ver Detalhes do Cluster <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
