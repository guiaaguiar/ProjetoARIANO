import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, Network, Zap, Target, Share2 } from 'lucide-react';
import { NetworkXGraphView } from '../components/NetworkXGraphView';
import { NODE_LABELS, type EntityType, NODE_COLORS } from '../types';

export default function GrafoPage() {
  const [selectedNode, setSelectedNode] = useState<any | null>(null);

  const deselectNode = () => setSelectedNode(null);

  return (
    <div className="container-fluid py-4 h-[calc(100vh-88px)] lg:h-[calc(100vh-56px)] flex flex-col gap-4 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="page-header !mb-0"
        >
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
            <div className="px-3 py-1.5 rounded-lg bg-gray-900/50 border border-white/5 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live Graph</span>
            </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        {/* Interactive Graph Canvas */}
        <div className="flex-1 min-h-0 relative">
          <NetworkXGraphView onNodeClick={setSelectedNode} />
        </div>

        {/* Intelligence Detail Panel */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              className="w-full lg:w-80 flex flex-col rounded-3xl border border-white/10 bg-gray-900/40 backdrop-blur-xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black shadow-inner"
                      style={{ backgroundColor: `${NODE_COLORS[selectedNode.type as EntityType] || '#333'}20`, color: NODE_COLORS[selectedNode.type as EntityType] || '#fff', border: `1px solid ${NODE_COLORS[selectedNode.type as EntityType]}30` }}>
                      {selectedNode.label.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white truncate max-w-[160px]">{selectedNode.label}</h3>
                      <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                        {NODE_LABELS[selectedNode.type as EntityType]}
                      </span>
                    </div>
                  </div>
                  <button onClick={deselectNode} className="p-2 text-gray-500 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                        <p className="text-[9px] text-gray-500 uppercase font-black mb-1">Cluster CoT</p>
                        <p className="text-lg font-black text-teal-400 font-mono">#{selectedNode.cluster_id}</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                        <p className="text-[9px] text-gray-500 uppercase font-black mb-1">Poder Cognitivo</p>
                        <p className="text-lg font-black text-purple-400 font-mono">{selectedNode.influence.toFixed(1)}</p>
                    </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                    <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-4 flex items-center gap-2">
                        <Zap size={12} className="text-teal-400" />
                        Raciocínio NetworkX
                    </h4>
                    <div className="p-4 rounded-2xl bg-teal-400/5 border border-teal-400/10 space-y-3">
                        <p className="text-xs text-gray-300 leading-relaxed italic">
                           "Nó identificado no Cluster de Inovação #{selectedNode.cluster_id}. 
                           Apresenta centralidade estratégica de {selectedNode.influence.toFixed(2)}, atuando como ponte em fluxos de conhecimento."
                        </p>
                    </div>
                </div>

                {Object.entries(selectedNode.metadata || {}).filter(([, v]) => v).length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-black flex items-center gap-2">
                        <Target size={12} className="text-blue-400" />
                        Metadados Estruturais
                    </h4>
                    <div className="grid gap-2">
                      {Object.entries(selectedNode.metadata).filter(([, v]) => v).map(([key, val]) => (
                        <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                          <span className="text-[10px] text-gray-400 capitalize">{key.replace(/_/g, ' ')}</span>
                          <span className="text-[10px] text-white font-bold text-right truncate max-w-[120px]">
                            {String(val)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 bg-gray-900/80 border-t border-white/5">
                 <button className="w-full py-3 rounded-2xl bg-teal-500 text-void font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-teal-400 transition-colors">
                    <Share2 size={16} /> Ver Conexões
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-gray-900/40 border border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3 text-gray-500 text-[10px] font-medium">
          <Info size={14} className="text-teal-500" />
          <span>Arraste os nós para reorganizar · Use o scroll para zoom · Clique para insights profundos via NetworkX</span>
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
