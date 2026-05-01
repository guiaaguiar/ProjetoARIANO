import React, { useState, useEffect, useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Loader2, Zap, Maximize2, Network } from 'lucide-react';
import * as api from '../lib/api';
import { NODE_COLORS, type EntityType } from '../types';

// ─── Tipos ───────────────────────────────────────────────────────────────────
interface GraphNode {
  id: string;
  label: string;
  type: string;
  cluster_id: number;
  cluster_theme: string;
  influence: number;
  connectivity: number;
  connections: { uid: string; label: string; type: string; edge_type: string }[];
  metadata: Record<string, unknown>;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  label: string;
}

interface Props {
  onNodeClick?: (node: GraphNode) => void;
}

// ─── Constantes visuais ───────────────────────────────────────────────────────
const CLUSTER_COLORS = [
  '#2dd4bf', '#3b82f6', '#a855f7', '#f59e0b',
  '#ef4444', '#10b981', '#6366f1', '#ec4899',
];

const NODE_BASE_SIZE: Record<string, number> = {
  area: 5,
  skill: 7,
  edital: 11,
  student: 13,
  researcher: 13,
  professor: 13,
};

const LINK_COLORS: Record<string, string> = {
  ELIGIBLE_FOR: '#2dd4bf',
  SIMILAR_TO: '#a855f7',
  HAS_SKILL: '#6366f1',
  REQUIRES_SKILL: '#38bdf8',
  RESEARCHES_AREA: '#34d399',
  TARGETS_AREA: '#818cf8',
  ADVISES: '#fbbf24',
  RELATED_TO: '#f472b6',
  OVERLAPS_WITH: '#fb923c',
};

const LINK_WIDTHS: Record<string, number> = {
  ELIGIBLE_FOR: 3,
  SIMILAR_TO: 2.5,
  ADVISES: 2.5,
  RELATED_TO: 2,
  HAS_SKILL: 1.5,
  REQUIRES_SKILL: 1.5,
};

const getNodeSize = (node: GraphNode): number => {
  const base = NODE_BASE_SIZE[node.type] ?? 10;
  const bonus = Math.min((node.influence / 300) * base * 0.4, base * 0.5);
  const max = node.type === 'area' ? 8 : 22;
  return Math.min(base + bonus, max);
};

// ─── Componente ───────────────────────────────────────────────────────────────
export const NetworkXGraphView: React.FC<Props> = ({ onNodeClick }) => {
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] } | null>(null);
  const [clusters, setClusters] = useState<{ id: number; theme: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const fgRef = useRef<any>(null);
  const dataRef = useRef<{ nodes: GraphNode[]; links: GraphLink[] } | null>(null);

  // ─── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    api.getEnrichedGraph()
      .then(res => {
        if (res.error) {
          console.error('Grafo:', res.error);
          return;
        }
        setClusters(res.summary?.clusters || []);
        const data = {
          nodes: res.nodes as GraphNode[],
          links: (res.edges as any[]).map(e => ({
            source: e.source,
            target: e.target,
            label: e.label,
          })),
        };
        setGraphData(data);
        dataRef.current = data;

        // Após simulação estabilizar, congela todos os nós
        setTimeout(() => {
          if (fgRef.current) fgRef.current.zoomToFit(600, 80);
          setTimeout(() => freezeAllNodes(), 4000);
        }, 500);
      })
      .catch(err => console.error('Erro ao buscar grafo:', err))
      .finally(() => setLoading(false));
  }, []);

  const freezeAllNodes = () => {
    if (!dataRef.current) return;
    dataRef.current.nodes.forEach(n => {
      if (n.x !== undefined) { n.fx = n.x; n.fy = n.y; }
    });
  };

  // ─── Halos de Cluster (Frente 7) ──────────────────────────────────────────
  const onRenderFramePre = useCallback((ctx: CanvasRenderingContext2D, globalScale: number) => {
    if (!dataRef.current) return;
    const nodes = dataRef.current.nodes;

    // Agrupar nós por cluster
    const groups: Record<number, GraphNode[]> = {};
    nodes.forEach(n => {
      if (n.x === undefined) return;
      const cid = n.cluster_id ?? 0;
      if (!groups[cid]) groups[cid] = [];
      groups[cid].push(n);
    });

    Object.entries(groups).forEach(([cidStr, members]) => {
      if (members.length < 1) return;
      const cid = parseInt(cidStr);
      const color = CLUSTER_COLORS[cid % CLUSTER_COLORS.length];

      const cx = members.reduce((s, n) => s + (n.x || 0), 0) / members.length;
      const cy = members.reduce((s, n) => s + (n.y || 0), 0) / members.length;
      const rawRadius = members.length === 1
        ? 30
        : Math.max(...members.map(n => Math.hypot((n.x || 0) - cx, (n.y || 0) - cy)));
      const radius = rawRadius + 28;

      // Halo preenchido suave
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = `${color}0d`;
      ctx.fill();

      // Borda tracejada neon
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `${color}35`;
      ctx.lineWidth = 1.5 / globalScale;
      ctx.setLineDash([8 / globalScale, 5 / globalScale]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label do tema no topo do halo
      const theme = members[0]?.cluster_theme || `Cluster ${cid}`;
      const fontSize = Math.max(9, 13 / globalScale);
      ctx.font = `bold ${fontSize}px Inter, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';

      // Fundo do label
      const textW = ctx.measureText(theme).width;
      ctx.fillStyle = 'rgba(2, 8, 16, 0.55)';
      ctx.fillRect(cx - textW / 2 - 4, cy - radius - fontSize - 2, textW + 8, fontSize + 4);

      ctx.fillStyle = `${color}cc`;
      ctx.fillText(theme, cx, cy - radius + 2);
    });
  }, []);

  // ─── Desenho de Nó (Frentes 1, 3, 5) ─────────────────────────────────────
  const drawNode = useCallback((node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
    if (node.x === undefined || node.y === undefined) return;

    const size = getNodeSize(node);
    const clusterColor = CLUSTER_COLORS[(node.cluster_id ?? 0) % CLUSTER_COLORS.length];
    const nodeColor = NODE_COLORS[node.type as EntityType] || clusterColor;
    const label = node.label || node.id;

    // Anel externo de cluster (glow aura)
    const auraSize = size + 5 / globalScale;
    ctx.beginPath();
    ctx.arc(node.x, node.y, auraSize, 0, Math.PI * 2);
    ctx.fillStyle = `${clusterColor}18`;
    ctx.fill();

    // Glow principal
    ctx.shadowColor = nodeColor;
    ctx.shadowBlur = 22 / globalScale;

    // Círculo principal
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
    ctx.fillStyle = nodeColor;
    ctx.fill();

    // Highlight interno
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(node.x, node.y - size * 0.25, size * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fill();

    // Borda de cluster
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
    ctx.strokeStyle = `${clusterColor}90`;
    ctx.lineWidth = 1.5 / globalScale;
    ctx.stroke();

    // ─── Label (Frente 1: sempre visível, dentro do nó) ───────────────────
    const minFontPx = 6.5;

    if (size >= 9) {
      // Label dentro do nó
      const rawFontPx = Math.max(minFontPx, (size * 1.15) / globalScale);
      ctx.font = `bold ${rawFontPx}px Inter, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Truncar para caber dentro
      let display = label;
      const maxW = size * 1.7;
      while (ctx.measureText(display).width > maxW && display.length > 2) {
        display = display.slice(0, -2) + '…';
      }

      // Contorno escuro para legibilidade
      ctx.strokeStyle = 'rgba(0,0,0,0.85)';
      ctx.lineWidth = 3.5 / globalScale;
      ctx.strokeText(display, node.x, node.y);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(display, node.x, node.y);
    } else {
      // Nós pequenos (área): label mínima abaixo
      const fontPx = Math.max(minFontPx, 8 / globalScale);
      ctx.font = `${fontPx}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const tw = ctx.measureText(label).width;
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(node.x - tw / 2 - 1, node.y + size + 1, tw + 2, fontPx + 2);
      ctx.fillStyle = `${nodeColor}dd`;
      ctx.fillText(label, node.x, node.y + size + 2);
    }
  }, []);

  // ─── Arrastar individual (Frente 6) ───────────────────────────────────────
  const handleNodeDrag = useCallback((node: GraphNode) => {
    // Congela todos os outros nós para arraste individual
    if (!dataRef.current) return;
    dataRef.current.nodes.forEach(n => {
      if (n.id !== node.id && n.x !== undefined) {
        n.fx = n.x;
        n.fy = n.y;
      }
    });
  }, []);

  const handleNodeDragEnd = useCallback((node: GraphNode) => {
    if (!dataRef.current) return;
    // Libera todos, fixa apenas o que foi movido
    dataRef.current.nodes.forEach(n => {
      if (n.id !== node.id) {
        delete n.fx;
        delete n.fy;
      }
    });
    node.fx = node.x;
    node.fy = node.y;
    setTimeout(() => freezeAllNodes(), 1500);
  }, []);

  // ─── Render ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full rounded-3xl border border-border/40" style={{ background: 'rgba(2,8,16,0.82)' }}>
        <Loader2 className="w-12 h-12 text-teal-400 animate-spin mb-4" />
        <p className="text-white font-bold text-lg">Contextualizando CoTs...</p>
        <p className="text-gray-500 text-xs mt-1">NetworkX detectando comunidades de pensamento</p>
      </div>
    );
  }

  return (
    <div
      className="w-full h-full relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
      style={{ background: 'rgba(2, 8, 16, 0.78)', backdropFilter: 'blur(3px)' }}
    >
      {graphData && graphData.nodes.length > 0 ? (
        <ForceGraph2D
          ref={fgRef}
          graphData={graphData}
          backgroundColor="rgba(0,0,0,0)"
          nodeCanvasObject={drawNode as any}
          nodePointerAreaPaint={(node: any, color, ctx) => {
            const size = getNodeSize(node as GraphNode) + 4;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
            ctx.fill();
          }}
          linkColor={(link: any) => LINK_COLORS[link.label] || 'rgba(255,255,255,0.18)'}
          linkWidth={(link: any) => LINK_WIDTHS[link.label] || 1.5}
          linkDirectionalParticles={(link: any) => (link.label === 'ELIGIBLE_FOR' || link.label === 'SIMILAR_TO') ? 3 : 0}
          linkDirectionalParticleWidth={2.5}
          linkDirectionalParticleColor={(link: any) => LINK_COLORS[link.label] || '#fff'}
          linkDirectionalParticleSpeed={0.004}
          onRenderFramePre={onRenderFramePre as any}
          onNodeClick={(node) => onNodeClick?.(node as GraphNode)}
          onNodeDrag={handleNodeDrag as any}
          onNodeDragEnd={handleNodeDragEnd as any}
          enableNodeDrag={true}
          enableZoomInteraction={true}
          d3AlphaDecay={0.03}
          d3VelocityDecay={0.35}
          warmupTicks={80}
          cooldownTicks={200}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
            <Network className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Ecossistema em Silêncio</h3>
          <p className="text-gray-500 max-w-md mb-8">
            Nenhum dado de rede localizado. Certifique-se de que existem acadêmicos e editais cadastrados.
          </p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
            Tentar Novamente
          </button>
        </div>
      )}

      {/* Legenda CoT */}
      <div className="absolute top-4 left-4 pointer-events-none max-w-[240px]">
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl">
          <h4 className="text-[9px] uppercase tracking-[0.2em] text-teal-400 font-black mb-3 flex items-center gap-1.5">
            <Zap className="w-2.5 h-2.5 animate-pulse" />
            Comunidades de Pensamento
          </h4>
          <div className="space-y-2">
            {clusters.slice(0, 6).map((c) => (
              <div key={c.id} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    backgroundColor: CLUSTER_COLORS[c.id % CLUSTER_COLORS.length],
                    boxShadow: `0 0 8px ${CLUSTER_COLORS[c.id % CLUSTER_COLORS.length]}`,
                  }}
                />
                <div>
                  <span className="text-[9px] text-white font-bold truncate block leading-tight">{c.theme}</span>
                  <span className="text-[7px] text-gray-600 font-mono uppercase">CoT #{c.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="absolute bottom-4 right-4">
        <button
          onClick={() => fgRef.current?.zoomToFit(400)}
          className="p-2.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-teal-500/20 hover:border-teal-500/40 transition-all"
          title="Ajustar ao ecrã"
        >
          <Maximize2 size={16} />
        </button>
      </div>
    </div>
  );
};
