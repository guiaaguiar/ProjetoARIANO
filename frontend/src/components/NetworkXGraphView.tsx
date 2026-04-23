import React, { useState, useEffect, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Loader2, Zap, Info, Maximize2, MousePointer2, Network } from 'lucide-react';
import * as api from '../lib/api';
import { NODE_COLORS, type EntityType } from '../types';

interface Node {
  id: string;
  label: string;
  type: string;
  cluster_id: number;
  cluster_theme: string;
  influence: number;
  x?: number;
  y?: number;
}

interface Edge {
  source: string;
  target: string;
  label: string;
}

interface Props {
  onNodeClick?: (node: any) => void;
}

const CLUSTER_COLORS = [
  '#2dd4bf', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444', '#10b981', '#6366f1', '#ec4899',
];

export const NetworkXGraphView: React.FC<Props> = ({ onNodeClick }) => {
  const [data, setData] = useState<{ nodes: Node[], links: Edge[] } | null>(null);
  const [clusters, setClusters] = useState<{id: number, theme: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const fgRef = useRef<any>(null);

  useEffect(() => {
    api.getEnrichedGraph()
      .then(res => {
        if (res.error) {
           console.error(res.error);
        } else {
           setClusters(res.summary?.clusters || []);
           const graphData = {
             nodes: res.nodes,
             links: res.edges.map((e: any) => ({
               source: e.source,
               target: e.target,
               label: e.label
             }))
           };
           setData(graphData);
           
           // Forçar um pequeno delay para a simulação estabilizar
           setTimeout(() => {
             if (fgRef.current) {
                fgRef.current.zoomToFit(400, 100);
             }
           }, 500);
        }
      })
      .catch(err => console.error("Erro ao buscar grafo:", err))
      .finally(() => setLoading(false));
  }, []);

  const drawNode = (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    if (node.x === undefined || node.y === undefined) return;

    const label = node.label || 'Nó';
    const fontSize = 12 / globalScale;
    const size = Math.max(3, (node.influence || 5) * 0.5);
    const color = CLUSTER_COLORS[(node.cluster_id || 0) % CLUSTER_COLORS.length];
    const typeColor = NODE_COLORS[node.type as EntityType] || color;

    // Glow Effect
    ctx.shadowColor = color;
    ctx.shadowBlur = 10 / globalScale;
    
    // Core
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
    ctx.fillStyle = typeColor;
    ctx.fill();

    // Border
    ctx.strokeStyle = '#ffffff40';
    ctx.lineWidth = 1 / globalScale;
    ctx.stroke();

    // Label handling
    if (globalScale > 2 || node.influence > 20) {
      ctx.font = `${fontSize}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#e4e4ed';
      
      const textWidth = ctx.measureText(label).width;
      ctx.fillStyle = 'rgba(2, 8, 16, 0.6)';
      ctx.fillRect(node.x - textWidth/2 - 2, node.y + size + 2, textWidth + 4, fontSize + 2);
      
      ctx.fillStyle = '#e4e4ed';
      ctx.fillText(label, node.x, node.y + size + fontSize);
    }
    
    ctx.shadowBlur = 0;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#020810] rounded-3xl border border-border/40">
        <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
        <p className="text-text-primary font-bold text-lg">Contextualizando CoTs...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-[#020810] rounded-3xl overflow-hidden border border-border/30 shadow-2xl group">
      {data && data.nodes.length > 0 ? (
        <ForceGraph2D
          ref={fgRef}
          graphData={data}
          nodeCanvasObject={drawNode}
          nodePointerAreaPaint={(node: any, color, ctx) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, (node.influence || 5) * 0.5 + 2, 0, 2 * Math.PI, false);
            ctx.fill();
          }}
          linkColor={() => 'rgba(255, 255, 255, 0.08)'}
          linkWidth={1}
          onNodeClick={(node) => onNodeClick?.(node)}
          backgroundColor="#020810"
          enableNodeDrag={true}
          enableZoomInteraction={true}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
           <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
              <Network className="w-8 h-8 text-gray-600" />
           </div>
           <h3 className="text-xl font-bold text-white mb-2">Ecossistema em Silêncio</h3>
           <p className="text-gray-500 max-w-md mb-8">
             Nenhum dado de rede localizado. Certifique-se de que existem acadêmicos e editais cadastrados para visualizar as conexões.
           </p>
           <button 
             onClick={() => window.location.reload()}
             className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
           >
             Tentar Novamente
           </button>
        </div>
      )}

      {/* COT Legend Overlay */}
      <div className="absolute top-6 left-6 flex flex-col gap-3 pointer-events-none max-w-[280px]">
        <div className="bg-void/90 backdrop-blur-2xl border border-white/10 p-5 rounded-3xl shadow-2xl">
          <h4 className="text-[10px] uppercase tracking-[0.2em] text-teal-400 font-black mb-4 flex items-center gap-2">
            <Zap className="w-3 h-3 animate-pulse" />
            Temas de Comunidade (CoT)
          </h4>
          <div className="space-y-3">
            {clusters.slice(0, 6).map((c, i) => (
               <div key={i} className="flex items-center gap-3">
                 <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CLUSTER_COLORS[c.id % CLUSTER_COLORS.length], boxShadow: `0 0 10px ${CLUSTER_COLORS[c.id % CLUSTER_COLORS.length]}` }} />
                 <div className="flex flex-col">
                    <span className="text-[10px] text-white font-bold truncate leading-none mb-0.5">{c.theme}</span>
                    <span className="text-[8px] text-gray-500 font-mono uppercase tracking-tighter">Cluster {c.id}</span>
                 </div>
               </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2">
        <button onClick={() => fgRef.current?.zoomToFit(400)} className="btn-icon bg-surface/80 backdrop-blur-md border-white/10 text-white hover:bg-teal-500 hover:text-void">
          <Maximize2 size={18} />
        </button>
      </div>
    </div>
  );
};
