import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import {
  X, Info, Network, Zap, Target, Link2, ChevronRight,
  SlidersHorizontal, Eye, EyeOff, Layers, Sparkles,
} from 'lucide-react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { NetworkXGraphView, COT_COLORS } from '@/components/NetworkXGraphView';
import { NODE_LABELS, type EntityType, NODE_COLORS } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ─── Edge / Meta labels ─────────────────────────────────────────────────────
const EDGE_LABELS: Record<string, string> = {
  ELIGIBLE_FOR: 'Elegível',
  HAS_SKILL: 'Possui skill',
  REQUIRES_SKILL: 'Requer skill',
  RESEARCHES_AREA: 'Pesquisa área',
  TARGETS_AREA: 'Foca em área',
  ADVISES: 'Orienta',
  SIMILAR_TO: 'Similar a',
  RELATED_TO: 'Relacionado',
  OVERLAPS_WITH: 'Sobrepõe',
};

const META_LABELS: Record<string, string> = {
  institution: 'Instituição',
  maturidade: 'Maturidade',
  o_que_busco: 'O que busca',
  bio: 'Bio',
  funding: 'Financiamento (R$)',
  deadline: 'Prazo',
  edital_type: 'Tipo de Edital',
  instituicao: 'Inst. Responsável',
  category: 'Categoria',
  parent_area: 'Área Pai',
  course: 'Curso',
  semester: 'Semestre',
};

// Node types shown to the user (no admin-only types)
const USER_TYPES: { key: string; label: string }[] = [
  { key: 'edital', label: 'Editais' },
  { key: 'skill', label: 'Skills' },
  { key: 'area', label: 'Áreas' },
  { key: 'student', label: 'Estudantes' },
  { key: 'researcher', label: 'Pesquisadores' },
  { key: 'professor', label: 'Professores' },
];

type ViewMode = 'todos' | 'editais' | 'pessoas' | 'habilidades';

const VIEW_LABELS: Record<ViewMode, string> = {
  todos: 'Todos os nós',
  editais: 'Apenas Editais',
  pessoas: 'Apenas Pessoas',
  habilidades: 'Skills & Áreas',
};

// Map view mode → hidden types
const VIEW_HIDDEN: Record<ViewMode, string[]> = {
  todos: [],
  editais: ['student', 'researcher', 'professor', 'skill', 'area'],
  pessoas: ['edital', 'skill', 'area'],
  habilidades: ['edital', 'student', 'researcher', 'professor'],
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function PublicEcossistema() {
  const { user } = useAuthStore();
  const [params, setParams] = useSearchParams();
  const navigateFnRef = useRef<((uid: string) => void) | null>(null);

  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('todos');

  // Node type toggles — synced with view mode
  const [manualHidden, setManualHidden] = useState<string[]>([]);
  const hiddenTypes = useMemo(() => {
    const base = VIEW_HIDDEN[viewMode];
    return new Set([...base, ...manualHidden.filter(t => !base.includes(t))]);
  }, [viewMode, manualHidden]);

  // CoT controls
  const [showCoT, setShowCoT] = useState(true);
  const [activeCoT, setActiveCoT] = useState<number | null>(null);
  const [clusterList, setClusterList] = useState<{ id: number; theme: string }[]>([]);
  const [userClusterId, setUserClusterId] = useState<number | null>(null);

  // Personal stats from backend
  const [personalStats, setPersonalStats] = useState<Record<string, any> | null>(null);

  // Focus from URL params (e.g. coming from /editais)
  const focusId = params.get('focus') || params.get('highlight');

  // Build personal graph URL
  const graphApiUrl = user?.uid ? `/api/graph/personal/${user.uid}` : undefined;

  const toggleManualType = (key: string) => {
    setManualHidden(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const toggleCoT = (id: number) => {
    setActiveCoT(prev => (prev === id ? null : id));
  };

  const resetFilters = () => {
    setViewMode('todos');
    setManualHidden([]);
    setShowCoT(true);
    setActiveCoT(null);
  };

  const activeFiltersCount =
    (viewMode !== 'todos' ? 1 : 0) +
    manualHidden.length +
    (!showCoT ? 1 : 0) +
    (activeCoT !== null ? 1 : 0);

  // ESC closes panels
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedNode) setSelectedNode(null);
        else if (filterOpen) setFilterOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedNode, filterOpen]);

  // When clusters load, find the user's own cluster
  const handleClustersLoaded = useCallback((clusters: { id: number; theme: string }[]) => {
    setClusterList(clusters);
  }, []);

  const handleStatsLoaded = useCallback((stats: Record<string, unknown>) => {
    setPersonalStats(stats as Record<string, any>);
    if (stats.cluster_id !== undefined) {
      setUserClusterId(stats.cluster_id as number);
    }
  }, []);

  // If focusId in URL, navigate to that node once graph loads
  useEffect(() => {
    if (!focusId || !navigateFnRef.current) return;
    const timer = setTimeout(() => {
      navigateFnRef.current?.(focusId);
    }, 1500);
    return () => clearTimeout(timer);
  }, [focusId]);

  const clearFocus = () => {
    const p = new URLSearchParams(params);
    p.delete('focus');
    p.delete('highlight');
    setParams(p, { replace: true });
  };

  return (
    <PublicLayout>
      <div className="px-4 md:px-6 py-5 h-[calc(100vh-56px)] flex flex-col gap-4 overflow-hidden">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-shrink-0">
          <div>
            <p className="text-[12px] uppercase tracking-[0.18em] text-primary mb-1 flex items-center gap-2 font-semibold">
              <Network className="h-3 w-3" /> Ecossistema
            </p>
            <h1 className="text-[20px] md:text-[24px] font-medium tracking-tight text-foreground leading-[1.1]">
              Sua topologia de conexões
            </h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View mode pills */}
            <div className="flex items-center gap-1 bg-card/60 border border-border rounded-xl p-1">
              {(Object.keys(VIEW_LABELS) as ViewMode[]).map(v => (
                <button
                  key={v}
                  onClick={() => { setViewMode(v); setManualHidden([]); }}
                  className={cn(
                    'px-3 h-7 text-[11px] rounded-lg border transition-all font-medium',
                    viewMode === v
                      ? 'border-primary/60 bg-primary/10 text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  {VIEW_LABELS[v]}
                </button>
              ))}
            </div>

            {/* Filter button */}
            <button
              onClick={() => setFilterOpen(v => !v)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-widest transition-all',
                filterOpen || activeFiltersCount > 0
                  ? 'bg-primary/15 border-primary/40 text-primary'
                  : 'bg-card/50 border-border text-muted-foreground hover:text-foreground'
              )}
            >
              <SlidersHorizontal size={13} />
              Filtros
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[8px] font-black flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Live indicator */}
            <div className="px-3 py-1.5 rounded-lg bg-card/50 border border-border flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Live Graph</span>
            </div>
          </div>
        </div>

        {/* Focus banner */}
        {focusId && (
          <div className="flex-shrink-0 flex items-center gap-3 px-4 py-2.5 rounded-xl border border-primary/40 bg-primary/10 backdrop-blur">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <p className="text-[13px] text-foreground flex-1">
              Focando no nó: <span className="font-mono text-primary text-xs">{focusId}</span>
            </p>
            <button onClick={clearFocus} className="text-muted-foreground hover:text-foreground transition-colors">
              <X size={16} />
            </button>
          </div>
        )}

        {/* ── Main canvas + floating panels ──────────────────────────────── */}
        <div className="flex-1 min-h-0 relative">
          {graphApiUrl && (
            <NetworkXGraphView
              apiUrl={graphApiUrl}
              isUserMode={true}
              onNodeClick={setSelectedNode}
              hiddenTypes={hiddenTypes}
              showCoT={showCoT}
              activeCoT={activeCoT}
              selectedNodeId={selectedNode?.id ?? null}
              onNavigateToNode={navigateFnRef}
              filterPanelOpen={filterOpen}
              detailPanelOpen={!!selectedNode}
              onBackgroundClick={() => setSelectedNode(null)}
              onClustersLoaded={handleClustersLoaded}
              onStatsLoaded={handleStatsLoaded}
            />
          )}

          {/* ── Filter Panel (left slide-in) ─────────────────────────────── */}
          <AnimatePresence>
            {filterOpen && (
              <motion.div
                key="filter-panel"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                className="absolute top-0 left-0 h-full w-64 flex flex-col border-r border-white/10 bg-black/80 backdrop-blur-2xl overflow-hidden shadow-2xl z-20"
              >
                {/* Panel header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal size={13} className="text-primary" />
                    <span className="text-xs font-black uppercase tracking-widest text-white">Filtros do Grafo</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={resetFilters}
                        className="text-[8px] text-muted-foreground hover:text-red-400 uppercase font-bold transition-colors"
                      >
                        Limpar
                      </button>
                    )}
                    <button onClick={() => setFilterOpen(false)} className="p-1 text-gray-600 hover:text-white transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-5">

                  {/* ── Node Types ─────────────────────────────────────── */}
                  <div>
                    <p className="text-[8px] uppercase tracking-widest text-gray-500 font-black mb-3">Tipos de Nó</p>
                    <div className="space-y-1.5">
                      {USER_TYPES.map(({ key, label }) => {
                        const hidden = hiddenTypes.has(key);
                        const color = NODE_COLORS[key as EntityType] || '#888';
                        return (
                          <button
                            key={key}
                            onClick={() => toggleManualType(key)}
                            className={cn(
                              'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all text-left',
                              hidden
                                ? 'bg-white/[0.02] border-white/[0.04] opacity-50'
                                : 'bg-white/[0.05] border-white/[0.08] hover:bg-white/[0.08]'
                            )}
                          >
                            <div
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{
                                backgroundColor: hidden ? '#444' : color,
                                boxShadow: hidden ? 'none' : `0 0 6px ${color}`,
                              }}
                            />
                            <span className="text-[10px] text-white font-semibold flex-1">{label}</span>
                            {hidden ? (
                              <EyeOff size={11} className="text-gray-600" />
                            ) : (
                              <Eye size={11} className="text-gray-400" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── CoT — Communities ──────────────────────────────── */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[8px] uppercase tracking-widest text-gray-500 font-black">
                        Comunidades (CoT)
                      </p>
                      {activeCoT !== null && (
                        <button
                          onClick={() => setActiveCoT(null)}
                          className="text-[7px] text-primary uppercase font-bold hover:opacity-80 transition-opacity"
                        >
                          Ver todas
                        </button>
                      )}
                    </div>

                    {/* Toggle halos */}
                    <button
                      onClick={() => setShowCoT(v => !v)}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border mb-2 transition-all',
                        showCoT
                          ? 'bg-primary/10 border-primary/20 hover:bg-primary/15'
                          : 'bg-white/[0.02] border-white/[0.04] opacity-60'
                      )}
                    >
                      <Layers size={11} className={showCoT ? 'text-primary' : 'text-gray-600'} />
                      <span className="text-[10px] font-semibold text-white flex-1">
                        {showCoT ? 'Halos visíveis' : 'Halos ocultos'}
                      </span>
                      {showCoT ? (
                        <Eye size={11} className="text-primary" />
                      ) : (
                        <EyeOff size={11} className="text-gray-600" />
                      )}
                    </button>

                    {/* Individual CoT filter */}
                    <div className="space-y-1">
                      {clusterList.map((cluster) => {
                        const cid = cluster.id;
                        const color = COT_COLORS[cid % COT_COLORS.length];
                        const isActive = activeCoT === cid;
                        const isIdle = activeCoT !== null && !isActive;
                        const isUserCluster = cid === userClusterId;
                        return (
                          <button
                            key={cid}
                            onClick={() => toggleCoT(cid)}
                            className={cn(
                              'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all',
                              isActive
                                ? 'border-primary/40 bg-primary/10'
                                : isIdle
                                ? 'opacity-35 bg-white/[0.02] border-white/[0.03]'
                                : 'bg-white/[0.04] border-white/[0.07] hover:bg-white/[0.07]'
                            )}
                          >
                            <div
                              className="w-2.5 h-2.5 rounded-sm shrink-0"
                              style={{
                                backgroundColor: color,
                                boxShadow: isActive ? `0 0 8px ${color}` : 'none',
                                opacity: isIdle ? 0.4 : 1,
                              }}
                            />
                            <span className="text-[9px] text-white font-semibold flex-1 text-left line-clamp-1" title={cluster.theme}>
                              {cluster.theme}
                            </span>
                            {isUserCluster && !isActive && (
                              <span className="text-[7px] text-primary uppercase font-bold shrink-0">Seu grupo</span>
                            )}
                            {isActive && (
                              <span className="text-[7px] text-primary uppercase font-bold shrink-0">Isolada</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[7px] text-gray-600 mt-2 text-center">
                      Clique para isolar · Clique novamente para desfazer
                    </p>
                  </div>

                  {/* ── Personal stats ─────────────────────────────────── */}
                  {personalStats && (
                    <div>
                      <p className="text-[8px] uppercase tracking-widest text-gray-500 font-black mb-3">Seu Posicionamento</p>
                      <div className="space-y-2">
                        {personalStats.cluster_theme && (
                          <div className="px-3 py-2 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-2">
                            <Zap size={10} className="text-primary shrink-0" />
                            <div className="min-w-0">
                              <p className="text-[8px] text-gray-500 uppercase font-bold">CoT Principal</p>
                              <p className="text-[10px] text-white font-semibold truncate">{personalStats.cluster_theme}</p>
                            </div>
                          </div>
                        )}
                        {personalStats.connectivity_score !== undefined && (
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-center">
                              <p className="text-[7px] text-gray-500 uppercase font-black mb-1">Conectividade</p>
                              <p className="text-sm font-black text-primary font-mono">
                                {Math.round((personalStats.connectivity_score as number) * 100)}%
                              </p>
                            </div>
                            <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-center">
                              <p className="text-[7px] text-gray-500 uppercase font-black mb-1">Influência</p>
                              <p className="text-sm font-black text-purple-400 font-mono">
                                {Math.round((personalStats.influence_percentile as number ?? 0) * 100)}º%
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Node Detail Panel (right slide-in) ─────────────────────── */}
          <AnimatePresence>
            {selectedNode && (
              <motion.div
                key={selectedNode.id}
                initial={{ x: 32, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 32, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                className="absolute top-0 right-0 h-full w-80 flex flex-col border-l border-white/10 bg-black/80 backdrop-blur-2xl overflow-hidden shadow-2xl z-20"
              >
                {/* Header */}
                <div className="p-5 border-b border-white/5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-black shadow-inner shrink-0"
                        style={{
                          backgroundColor: `${NODE_COLORS[selectedNode.type as EntityType] || '#333'}20`,
                          color: NODE_COLORS[selectedNode.type as EntityType] || '#fff',
                          border: `1.5px solid ${NODE_COLORS[selectedNode.type as EntityType] || '#444'}40`,
                        }}
                      >
                        {(selectedNode.label || '??').split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-white truncate">{selectedNode.label}</h3>
                        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                          {NODE_LABELS[selectedNode.type as EntityType] || selectedNode.type}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => setSelectedNode(null)} className="p-1.5 text-gray-600 hover:text-white transition-colors shrink-0">
                      <X size={18} />
                    </button>
                  </div>

                  {/* CoT badge */}
                  <div
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border"
                    style={{
                      backgroundColor: `${COT_COLORS[selectedNode.cluster_id % COT_COLORS.length]}15`,
                      borderColor: `${COT_COLORS[selectedNode.cluster_id % COT_COLORS.length]}40`,
                      color: COT_COLORS[selectedNode.cluster_id % COT_COLORS.length],
                    }}
                  >
                    <Zap size={9} />
                    {selectedNode.cluster_theme || `Cluster #${selectedNode.cluster_id}`}
                  </div>

                  {selectedNode.cluster_id === userClusterId && (
                    <Badge className="ml-2 text-[8px] bg-primary/20 text-primary border border-primary/30 font-bold">
                      Seu grupo
                    </Badge>
                  )}
                </div>

                {/* Metrics */}
                <div className="px-5 py-4 border-b border-white/5">
                  <p className="text-[9px] uppercase tracking-widest text-gray-500 font-black mb-3">Métricas NetworkX</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                      <p className="text-[8px] text-gray-500 uppercase font-black mb-1">Influência</p>
                      <p className="text-base font-black text-primary font-mono">{(selectedNode.influence || 0).toFixed(1)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                      <p className="text-[8px] text-gray-500 uppercase font-black mb-1">Conectividade</p>
                      <p className="text-base font-black text-purple-400 font-mono">{((selectedNode.connectivity || 0) * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                </div>

                {/* Scrollable details */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5">

                  {/* Node metadata */}
                  {selectedNode.metadata && Object.keys(selectedNode.metadata).length > 0 && (
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-gray-500 font-black mb-3 flex items-center gap-1.5">
                        <Target size={10} className="text-blue-400" />
                        Dados do Nó
                      </p>
                      <div className="space-y-1.5">
                        {Object.entries(selectedNode.metadata).map(([key, val]) => (
                          <div key={key} className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                            <span className="text-[9px] text-gray-500 capitalize shrink-0">
                              {META_LABELS[key] || key.replace(/_/g, ' ')}
                            </span>
                            <span className="text-[9px] text-white font-semibold text-right break-words max-w-[130px]">{String(val)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Connections */}
                  {selectedNode.connections && selectedNode.connections.length > 0 && (
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-gray-500 font-black mb-3 flex items-center gap-1.5">
                        <Link2 size={10} className="text-primary" />
                        Conexões ({selectedNode.connections.length})
                      </p>
                      <div className="space-y-1.5">
                        {selectedNode.connections.slice(0, 12).map((conn: any, i: number) => (
                          <button
                            key={i}
                            onClick={() => {
                              if (navigateFnRef.current) navigateFnRef.current(conn.uid);
                            }}
                            className="w-full flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-primary/10 hover:border-primary/30 transition-colors text-left"
                          >
                            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: NODE_COLORS[conn.type as EntityType] || '#666' }} />
                            <span className="text-[9px] text-white truncate flex-1">{conn.label}</span>
                            <span className="text-[7px] text-gray-600 uppercase font-bold shrink-0">{EDGE_LABELS[conn.edge_type] || conn.edge_type}</span>
                            <ChevronRight size={9} className="text-primary shrink-0" />
                          </button>
                        ))}
                        {selectedNode.connections.length > 12 && (
                          <p className="text-[8px] text-gray-600 text-center pt-1">
                            +{selectedNode.connections.length - 12} conexões adicionais
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* NetworkX insight */}
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-gray-500 font-black mb-3 flex items-center gap-1.5">
                      <Zap size={10} className="text-primary" />
                      Raciocínio ARIANO
                    </p>
                    <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                      <p className="text-[10px] text-gray-400 leading-relaxed italic">
                        "Nó identificado na CoT <strong className="text-primary">{selectedNode.cluster_theme}</strong>.
                        Influência PageRank de <strong className="text-white">{(selectedNode.influence || 0).toFixed(2)}</strong>,
                        com <strong className="text-white">{(selectedNode.connections || []).length}</strong> conexões diretas."
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-card/40 border border-border backdrop-blur-md">
          <div className="flex items-center gap-3 text-muted-foreground text-[10px] font-medium">
            <Info size={14} className="text-primary" />
            <span>Arraste · Scroll para zoom · Clique para detalhes · Use filtros para isolar grupos</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
              <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Engine: NetworkX 3.6</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]" />
              <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Graph-CoT Active</span>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
