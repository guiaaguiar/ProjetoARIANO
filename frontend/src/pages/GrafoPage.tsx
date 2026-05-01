import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, Network, Zap, Target, Link2, ChevronRight } from 'lucide-react';
import { NetworkXGraphView } from '../components/NetworkXGraphView';
import { NODE_LABELS, type EntityType, NODE_COLORS } from '../types';

const CLUSTER_COLORS = [
  '#2dd4bf', '#3b82f6', '#a855f7', '#f59e0b',
  '#ef4444', '#10b981', '#6366f1', '#ec4899',
];

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

export default function GrafoPage() {
  const [selectedNode, setSelectedNode] = useState<any | null>(null);

  const handleNodeClick = (node: any) => {
    setSelectedNode(node);
  };

  const handleClose = () => setSelectedNode(null);

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
        <div className="px-3 py-1.5 rounded-lg bg-gray-900/50 border border-white/5 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live Graph</span>
        </div>
      </div>

      {/* Main — canvas toma tela inteira, painel flutua sobre ele */}
      <div className="flex-1 min-h-0 relative">
        <NetworkXGraphView onNodeClick={handleNodeClick} />

        {/* Painel Lateral Rico — overlay absoluto à direita */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              key={selectedNode.id}
              initial={{ x: 32, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 32, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              className="absolute top-0 right-0 h-full w-80 flex flex-col border-l border-white/10 bg-black/70 backdrop-blur-2xl overflow-hidden shadow-2xl z-20"
            >
              {/* Cabeçalho do painel */}
              <div className="p-5 border-b border-white/5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-black shadow-inner shrink-0"
                      style={{
                        backgroundColor: `${NODE_COLORS[selectedNode.type as EntityType] || '#333'}20`,
                        color: NODE_COLORS[selectedNode.type as EntityType] || '#fff',
                        border: `1.5px solid ${NODE_COLORS[selectedNode.type as EntityType] || '#444'}40`,
                        boxShadow: `0 0 16px ${NODE_COLORS[selectedNode.type as EntityType] || '#444'}20`,
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
                  <button onClick={handleClose} className="p-1.5 text-gray-600 hover:text-white transition-colors shrink-0">
                    <X size={18} />
                  </button>
                </div>

                {/* Badge CoT */}
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border"
                  style={{
                    backgroundColor: `${CLUSTER_COLORS[selectedNode.cluster_id % CLUSTER_COLORS.length]}15`,
                    borderColor: `${CLUSTER_COLORS[selectedNode.cluster_id % CLUSTER_COLORS.length]}40`,
                    color: CLUSTER_COLORS[selectedNode.cluster_id % CLUSTER_COLORS.length],
                  }}
                >
                  <Zap size={9} />
                  {selectedNode.cluster_theme || `Cluster #${selectedNode.cluster_id}`}
                </div>
              </div>

              {/* Métricas NetworkX */}
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

              {/* Scroll area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">

                {/* Campos do Nó */}
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
                          <span className="text-[9px] text-white font-semibold text-right break-words max-w-[130px]">
                            {String(val)}
                          </span>
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

                {/* Insight NetworkX */}
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-gray-500 font-black mb-3 flex items-center gap-1.5">
                    <Zap size={10} className="text-teal-400" />
                    Raciocínio NetworkX
                  </p>
                  <div className="p-3 rounded-xl bg-teal-400/5 border border-teal-400/10">
                    <p className="text-[10px] text-gray-400 leading-relaxed italic">
                      "Nó identificado na CoT <strong className="text-teal-400">{selectedNode.cluster_theme}</strong>.
                      Influência PageRank de <strong className="text-white">{(selectedNode.influence || 0).toFixed(2)}</strong>,
                      com <strong className="text-white">{(selectedNode.connections || []).length}</strong> conexões diretas no ecossistema."
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
          <span>Arraste os nós · Scroll para zoom · Clique para insights · Nodes fixam após estabilização</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shadow-[0_0_8px_#2dd4bf]" />
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Engine: NetworkX 3.6</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]" />
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Mode: Graph-CoT Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
