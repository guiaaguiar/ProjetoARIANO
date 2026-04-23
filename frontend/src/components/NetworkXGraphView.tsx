import React, { useState, useEffect, useRef, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Loader2, Zap, Info, Maximize2, MousePointer2 } from 'lucide-react';
import * as api from '../lib/api';
import { NODE_COLORS, type EntityType } from '../types';

interface Node {
  id: string;
  label: string;
  type: string;
  cluster_id: number;
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
  const [loading, setLoading] = useState(true);
  const fgRef = useRef<any>(null);

  useEffect(() => {
    api.getEnrichedGraph()
      .then(res => {
        if (res.error) {
           console.error(res.error);
        } else {
           // Adaptar dados para ForceGraph (source/target links)
           const graphData = {
             nodes: res.nodes,
             links: res.edges.map((e: any) => ({
               source: e.source,
               target: e.target,
               label: e.label
             }))
           };
           setData(graphData);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Custom Node Drawing (Neon Style)
  const drawNode = (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.label;
    const fontSize = 12 / globalScale;
    const size = (node.influence || 5) * 0.8 + 4;
    const color = CLUSTER_COLORS[(node.cluster_id || 0) % CLUSTER_COLORS.length];
    const typeColor = NODE_COLORS[node.type as EntityType] || color;

    // Glow Effect
    ctx.shadowColor = color;
    ctx.shadowBlur = 15 / globalScale;
    
    // Core
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
    ctx.fillStyle = typeColor;
    ctx.fill();

    // Border
    ctx.strokeStyle = color;
    ctx.lineWidth = 2 / globalScale;
    ctx.stroke();

    // Label on hover or if influential
    if (globalScale > 1.5 || node.influence > 15) {
      ctx.font = `${fontSize}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#e4e4ed';
      
      // Text Background for readability
      const textWidth = ctx.measureText(label).width;
      ctx.fillStyle = 'rgba(2, 8, 16, 0.8)';
      ctx.fillRect(node.x - textWidth/2 - 2, node.y + size + 2, textWidth + 4, fontSize + 2);
      
      ctx.fillStyle = '#e4e4ed';
      ctx.fillText(label, node.x, node.y + size + fontSize);
    }
    
    ctx.shadowBlur = 0; // Reset for next items
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#020810] rounded-3xl border border-border/40">
        <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
        <div className="text-center space-y-2">
            <p className="text-text-primary font-bold text-lg">Iniciando Motor NetworkX Interativo...</p>
            <p className="text-text-secondary font-mono text-xs uppercase tracking-widest animate-pulse">
              Mapeando Comunidades de Pensamento (CoT)
            </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-[#020810] rounded-3xl overflow-hidden border border-border/30 shadow-2xl group">
      <ForceGraph2D
        ref={fgRef}
        graphData={data || { nodes: [], links: [] }}
        nodeLabel="label"
        nodeRelSize={6}
        nodeCanvasObject={drawNode}
        linkColor={() => 'rgba(45, 212, 191, 0.15)'}
        linkWidth={1.5}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.005}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleColor={() => '#2dd4bf'}
        onNodeClick={(node) => onNodeClick?.(node)}
        backgroundColor="#020810"
        cooldownTicks={100}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
      />

      {/* COT Legend Overlay */}
      <div className="absolute top-6 left-6 flex flex-col gap-3 pointer-events-none">
        <div className="bg-void/80 backdrop-blur-xl border border-accent/20 p-4 rounded-2xl shadow-2xl">
          <h4 className="text-[10px] uppercase tracking-[0.2em] text-accent font-bold mb-3 flex items-center gap-2">
            <Zap className="w-3 h-3 animate-pulse" />
            Comunidades de Pensamento (CoT)
          </h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {CLUSTER_COLORS.slice(0, 4).map((color, i) => (
               <div key={i} className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
                 <span className="text-[9px] text-text-secondary font-mono uppercase">Cluster {i}</span>
               </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2">
        <button onClick={() => fgRef.current.zoomToFit(400)} className="btn-icon bg-surface/80 backdrop-blur-md border-accent/20 text-accent hover:bg-accent hover:text-void">
          <Maximize2 size={18} />
        </button>
        <button className="btn-icon bg-surface/80 backdrop-blur-md border-accent/20 text-accent hover:bg-accent hover:text-void">
          <MousePointer2 size={18} />
        </button>
      </div>
      
      <div className="absolute bottom-6 left-6 flex items-center gap-2 text-[10px] text-text-muted bg-void/60 px-3 py-2 rounded-full backdrop-blur-sm border border-border/20">
        <Info size={12} className="text-accent" />
        Motor NetworkX Interativo · Arraste para explorar · Clique para detalhes
      </div>
    </div>
  );
};
