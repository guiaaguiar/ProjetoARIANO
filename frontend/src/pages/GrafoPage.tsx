import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Info, Network, Zap, Target, Link2, ChevronRight,
  SlidersHorizontal, Eye, EyeOff, Layers,
} from 'lucide-react';
import { NetworkXGraphView, COT_COLORS } from '../components/NetworkXGraphView';
import { NODE_LABELS, type EntityType, NODE_COLORS } from '../types';

// ─── Labels e configurações ───────────────────────────────────────────────────
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

const ALL_TYPES: { key: string; label: string }[] = [
  { key: 'student', label: 'Estudante' },
  { key: 'researcher', label: 'Pesquisador' },
  { key: 'professor', label: 'Professor' },
  { key: 'edital', label: 'Edital' },
  { key: 'skill', label: 'Skill' },
  { key: 'area', label: 'Área' },
];

// ─── Componente ───────────────────────────────────────────────────────────────
export default function GrafoPage() {
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  // Filtros de tipo de nó
  const [hiddenTypesList, setHiddenTypesList] = useState<string[]>([]);
  const hiddenTypes = useMemo(() => new Set(hiddenTypesList), [hiddenTypesList]);

  // Filtros CoT
  const [showCoT, setShowCoT] = useState(true);
  const [activeCoT, setActiveCoT] = useState<number | null>(null);

  // Clusters disponíveis (preenchidos quando o grafo carrega — vamos inferir pelo clique)
  // Usamos um estado externo para receber a lista de clusters do componente filho
  const [clusterList, setClusterList] = useState<{ id: number; theme: string }[]>([]);

  const toggleType = (key: string) => {
    setHiddenTypesList(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const toggleCoT = (id: number) => {
    setActiveCoT(prev => (prev === id ? null : id));
  };

  const resetFilters = () => {
    setHiddenTypesList([]);
    setShowCoT(true);
    setActiveCoT(null);
  };

  const activeFiltersCount =
    hiddenTypesList.length + (!showCoT ? 1 : 0) + (activeCoT !== null ? 1 : 0);

  return (
    <div className="container-fluid py-4 h-[calc(100vh-88px)] lg:h-[calc(100vh-56px)] flex flex-col gap-4 overflow-hidden">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="page-header !mb-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/10 rounded-xl border border-teal-500/20 shadow-[0_0_20px_rgba(45,212,191,0.1)]">
              <Network className="text-teal-400 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Cérebro CoT ARIANO</h1>
              <p className="text-xs text-gray-400 flex items-center gap-2">
                <span className="text-teal-400 font-mono font-bold px-1.5 py-0.5 bg-teal-400/10 rounded">NetworkX Interactive Engine</span>
                <span className="w-1 h-1 rounded-full bg-gray-600" />
                <span>Mapeamento de Comunidades Acadêmicas</span>
              </p>
            </div>
          </div>
        </motion.div>

        <div className="flex items-center gap-2">
          {/* Botão de filtros */}
          <button
            onClick={() => setFilterOpen(v => !v)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-widest transition-all ${
              filterOpen || activeFiltersCount > 0
                ? 'bg-teal-500/15 border-teal-500/40 text-teal-400'
                : 'bg-gray-900/50 border-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <SlidersHorizontal size={13} />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-teal-500 text-black text-[8px] font-black flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <div className="px-3 py-1.5 rounded-lg bg-gray-900/50 border border-white/5 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live Graph</span>
          </div>
        </div>
      </div>

      {/* Main — canvas + painéis flutuantes */}
      <div className="flex-1 min-h-0 relative">
        <NetworkXGraphView
          onNodeClick={setSelectedNode}
          hiddenTypes={hiddenTypes}
          showCoT={showCoT}
          activeCoT={activeCoT}
        />

        {/* ── Painel de Filtros (esquerda) ─────────────────────────────────── */}
        <AnimatePresence>
          {filterOpen && (
            <motion.div
              key="filter-panel"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="absolute top-0 left-0 h-full w-64 flex flex-col border-r border-white/10 bg-black/75 backdrop-blur-2xl overflow-hidden shadow-2xl z-20"
            >
              {/* Header painel */}
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={13} className="text-teal-400" />
                  <span className="text-xs font-black uppercase tracking-widest text-white">Filtros do Grafo</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={resetFilters}
                      className="text-[8px] text-gray-500 hover:text-red-400 uppercase font-bold transition-colors"
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

                {/* ── Tipos de Nó ──────────────────────────────────────────── */}
                <div>
                  <p className="text-[8px] uppercase tracking-widest text-gray-500 font-black mb-3">Tipos de Nó</p>
                  <div className="space-y-1.5">
                    {ALL_TYPES.map(({ key, label }) => {
                      const hidden = hiddenTypesList.includes(key);
                      const color = NODE_COLORS[key as EntityType] || '#888';
                      return (
                        <button
                          key={key}
                          onClick={() => toggleType(key)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all text-left ${
                            hidden
                              ? 'bg-white/[0.02] border-white/[0.04] opacity-50'
                              : 'bg-white/[0.05] border-white/[0.08] hover:bg-white/[0.08]'
                          }`}
                        >
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: hidden ? '#444' : color, boxShadow: hidden ? 'none' : `0 0 6px ${color}` }}
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

                {/* ── CoT — Comunidades ────────────────────────────────────── */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[8px] uppercase tracking-widest text-gray-500 font-black">Comunidades (CoT)</p>
                    {activeCoT !== null && (
                      <button
                        onClick={() => setActiveCoT(null)}
                        className="text-[7px] text-orange-400 uppercase font-bold hover:text-orange-300 transition-colors"
                      >
                        Ver todas
                      </button>
                    )}
                  </div>

                  {/* Toggle global de halos */}
                  <button
                    onClick={() => setShowCoT(v => !v)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border mb-2 transition-all ${
                      showCoT
                        ? 'bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/15'
                        : 'bg-white/[0.02] border-white/[0.04] opacity-60'
                    }`}
                  >
                    <Layers size={11} className={showCoT ? 'text-orange-400' : 'text-gray-600'} />
                    <span className="text-[10px] font-semibold text-white flex-1">
                      {showCoT ? 'Halos visíveis' : 'Halos ocultos'}
                    </span>
                    {showCoT ? (
                      <Eye size={11} className="text-orange-400" />
                    ) : (
                      <EyeOff size={11} className="text-gray-600" />
                    )}
                  </button>

                  {/* Filtro por CoT individual */}
                  <div className="space-y-1">
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((cid) => {
                      const color = COT_COLORS[cid % COT_COLORS.length];
                      const isActive = activeCoT === cid;
                      const isIdle = activeCoT !== null && !isActive;
                      return (
                        <button
                          key={cid}
                          onClick={() => toggleCoT(cid)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all ${
                            isActive
                              ? 'border-orange-400/40 bg-orange-400/10'
                              : isIdle
                              ? 'opacity-35 bg-white/[0.02] border-white/[0.03]'
                              : 'bg-white/[0.04] border-white/[0.07] hover:bg-white/[0.07]'
                          }`}
                        >
                          <div
                            className="w-2.5 h-2.5 rounded-sm shrink-0"
                            style={{
                              backgroundColor: color,
                              boxShadow: isActive ? `0 0 8px ${color}` : 'none',
                              opacity: isIdle ? 0.4 : 1,
                            }}
                          />
                          <span className="text-[9px] text-white font-semibold flex-1 text-left">CoT #{cid}</span>
                          {isActive && (
                            <span className="text-[7px] text-orange-400 uppercase font-bold">Isolada</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[7px] text-gray-600 mt-2 text-center">
                    Clique para isolar · Clique novamente para desfazer
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Painel de Detalhes do Nó (direita, overlay) ──────────────────── */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              key={selectedNode.id}
              initial={{ x: 32, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 32, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              className="absolute top-0 right-0 h-full w-80 flex flex-col border-l border-white/10 bg-black/75 backdrop-blur-2xl overflow-hidden shadow-2xl z-20"
            >
              {/* Cabeçalho */}
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

                {/* Badge CoT com cor quente */}
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
              </div>

              {/* Métricas */}
              <div className="px-5 py-4 border-b border-white/5">
                <p className="text-[9px] uppercase tracking-widest text-gray-500 font-black mb-3">Métricas NetworkX</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                    <p className="text-[8px] text-gray-500 uppercase font-black mb-1">Influência</p>
                    <p className="text-base font-black text-teal-400 font-mono">{(selectedNode.influence || 0).toFixed(1)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                    <p className="text-[8px] text-gray-500 uppercase font-black mb-1">Conectividade</p>
                    <p className="text-base font-black text-purple-400 font-mono">{((selectedNode.connectivity || 0) * 100).toFixed(0)}%</p>
                  </div>
                </div>
              </div>

              {/* Scroll */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">

                {/* Campos do nó */}
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

                {/* Conexões diretas */}
                {selectedNode.connections && selectedNode.connections.length > 0 && (
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-gray-500 font-black mb-3 flex items-center gap-1.5">
                      <Link2 size={10} className="text-teal-400" />
                      Conexões ({selectedNode.connections.length})
                    </p>
                    <div className="space-y-1.5">
                      {selectedNode.connections.slice(0, 12).map((conn: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-colors">
                          <div
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: NODE_COLORS[conn.type as EntityType] || '#666' }}
                          />
                          <span className="text-[9px] text-white truncate flex-1">{conn.label}</span>
                          <span className="text-[7px] text-gray-600 uppercase font-bold shrink-0">
                            {EDGE_LABELS[conn.edge_type] || conn.edge_type}
                          </span>
                          <ChevronRight size={9} className="text-gray-700 shrink-0" />
                        </div>
                      ))}
                      {selectedNode.connections.length > 12 && (
                        <p className="text-[8px] text-gray-600 text-center pt-1">
                          +{selectedNode.connections.length - 12} conexões adicionais
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Insight */}
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-gray-500 font-black mb-3 flex items-center gap-1.5">
                    <Zap size={10} className="text-teal-400" />
                    Raciocínio NetworkX
                  </p>
                  <div className="p-3 rounded-xl bg-teal-400/5 border border-teal-400/10">
                    <p className="text-[10px] text-gray-400 leading-relaxed italic">
                      "Nó identificado na CoT <strong className="text-teal-400">{selectedNode.cluster_theme}</strong>.
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

      {/* Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-gray-900/40 border border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3 text-gray-500 text-[10px] font-medium">
          <Info size={14} className="text-teal-500" />
          <span>Arraste · Scroll para zoom · Clique para detalhes · Use filtros para isolar grupos</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shadow-[0_0_8px_#2dd4bf]" />
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Engine: NetworkX 3.6</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]" />
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Graph-CoT Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
