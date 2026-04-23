import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Info } from 'lucide-react';
import { GraphSigma } from '../components/GraphSigma';
import { NODE_LABELS, type EntityType, NODE_COLORS } from '../types';

const EDGE_LABEL_MAP: Record<string, string> = {
  HAS_SKILL: 'possui',
  REQUIRES: 'requer',
  REQUIRES_SKILL: 'requer',
  TARGETS_AREA: 'foca em',
  RESEARCHES_AREA: 'pesquisa',
  ADVISES: 'orienta',
  COLLABORATES: 'colabora',
  ELIGIBLE_FOR: 'elegível',
};

export default function GrafoPage() {
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [graphInfo, setGraphInfo] = useState({ nodes: 0, edges: 0 });

  const deselectNode = () => setSelectedNode(null);
  const nodeColor = (type: string) => NODE_COLORS[type as EntityType] || '#64748b';

  return (
    <div className="container-fluid py-4 h-[calc(100vh-88px)] lg:h-[calc(100vh-56px)] flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="page-header !mb-0"
        >
          <h1>Grafo de Conhecimento</h1>
          <p>
            <span className="text-accent font-mono">Cognição NetworkX</span> · {' '}
            Visualização de Centralidade e Comunidades
          </p>
        </motion.div>
      </div>

      {/* Graph + Detail panel */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        {/* Graph Container (Sigma) */}
        <div className="flex-1 min-h-0">
          <GraphSigma onNodeClick={setSelectedNode} />
        </div>

        {/* Detail Panel — Desktop */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="hidden lg:flex flex-col rounded-xl border border-border bg-surface overflow-hidden min-w-[340px]"
            >
              <div className="border-b border-border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 min-w-[40px] rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ backgroundColor: `${selectedNode.color}25`, color: selectedNode.color, boxShadow: `0 0 15px ${selectedNode.color}30` }}>
                      {selectedNode.label.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-text-primary truncate">{selectedNode.label}</h3>
                      <span className="badge text-[10px] mt-0.5" style={{ backgroundColor: `${selectedNode.color}15`, borderColor: `${selectedNode.color}30`, color: selectedNode.color }}>
                        {NODE_LABELS[selectedNode.type as EntityType]}
                      </span>
                    </div>
                  </div>
                  <button onClick={deselectNode}
                    className="text-text-muted hover:text-text-primary p-1.5 rounded-lg hover:bg-surface-hover transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 p-4">
                {/* NetworkX Insights */}
                <div className="bg-void-light rounded-lg p-3 border border-accent/20">
                    <h4 className="text-[10px] text-accent uppercase tracking-wider mb-2 font-bold">NetworkX Insights</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                           <span className="text-text-muted">Comunidade:</span>
                           <span className="text-text-primary font-mono">Cluster #{selectedNode.cluster !== undefined ? selectedNode.cluster : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                           <span className="text-text-muted">Influência (PageRank):</span>
                           <span className="text-text-primary font-mono">{selectedNode.influence ? (selectedNode.influence * 100).toFixed(2) : '0.00'}%</span>
                        </div>
                    </div>
                </div>

                {Object.entries(selectedNode.metadata || {}).filter(([, v]) => v).length > 0 && (
                  <div>
                    <h4 className="text-[10px] text-text-muted uppercase tracking-wider mb-3 font-semibold px-1">Atributos</h4>
                    <div className="space-y-3 bg-void-light/50 rounded-lg p-3 border border-border/[0.3]">
                      {Object.entries(selectedNode.metadata).filter(([, v]) => v).map(([key, val]) => (
                        <div key={key} className="flex justify-between text-xs gap-2">
                          <span className="text-text-muted capitalize">{key.replace(/_/g, ' ')}</span>
                          <span className="text-text-primary font-medium text-right truncate max-w-[180px]">
                            {typeof val === 'number' && val >= 100
                              ? val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                              : String(val)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Bottom Sheet */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border rounded-t-2xl z-50 max-h-[50vh] overflow-y-auto"
          >
            <div className="p-5">
              <div className="w-10 h-1 rounded-full bg-border mx-auto mb-4" />
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: `${selectedNode.color}25`, color: selectedNode.color }}>
                    {selectedNode.label.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-primary">{selectedNode.label}</h3>
                    <span className="badge text-[10px]" style={{ backgroundColor: `${selectedNode.color}15`, borderColor: `${selectedNode.color}30`, color: selectedNode.color }}>
                      {NODE_LABELS[selectedNode.type as EntityType]}
                    </span>
                  </div>
                </div>
                <button onClick={deselectNode} className="text-text-muted hover:text-text-primary p-1.5">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-void-light p-3 rounded-lg border border-accent/20">
                      <p className="text-[9px] text-text-muted uppercase mb-1">Comunidade</p>
                      <p className="text-sm font-mono text-text-primary">#{selectedNode.cluster}</p>
                  </div>
                  <div className="bg-void-light p-3 rounded-lg border border-accent/20">
                      <p className="text-[9px] text-text-muted uppercase mb-1">PageRank</p>
                      <p className="text-sm font-mono text-text-primary">{selectedNode.influence ? (selectedNode.influence * 100).toFixed(1) : '0'}%</p>
                  </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      <div className="flex items-center gap-1.5 text-text-muted text-[10px] bg-void/30 px-3 py-2 rounded-lg self-start">
        <Info className="w-3 h-3" />
        Visualização de alto desempenho processada via Graphology + Sigma.js
      </div>
    </div>
  );
}
